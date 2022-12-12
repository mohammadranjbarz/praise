import { Request, Response } from 'express';
import { isArray } from 'lodash';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

import { BadRequestError, NotFoundError } from '@/error/errors';
import {
  getPraiseAllInput,
  getQueryInput,
  getQuerySort,
} from '@/shared/functions';
import {
  PaginatedResponseBody,
  Query,
  QueryInput,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
} from '@/shared/types';
import { quantifyPraise } from '@/praise/utils/quantify';
import { PraiseModel } from './entities';
import { praiseListTransformer, praiseTransformer } from './transformers';
import {
  PraiseAllInput,
  PraiseDetailsDto,
  PraiseDto,
  QuantificationCreateUpdateInput,
  QuantifyMultiplePraiseInput,
} from './types';

interface PraiseAllInputParsedQs extends Query, QueryInput, PraiseAllInput {}

/**
 * Fetch paginated list of Praise
 *
 * @param {TypedRequestQuery<PraiseAllInputParsedQs>} req
 * @param {TypedResponse<PaginatedResponseBody<PraiseDetailsDto>>} res
 * @returns {Promise<void>}
 */
export const all = async (
  req: TypedRequestQuery<PraiseAllInputParsedQs>,
  res: TypedResponse<PaginatedResponseBody<PraiseDetailsDto>>
): Promise<void> => {
  const query = getPraiseAllInput(req.query);
  const queryInput = getQueryInput(req.query);

  const praisePagination = await PraiseModel.paginate({
    query,
    ...queryInput,
    sort: getQuerySort(req.query),
    populate: 'giver receiver forwarder',
  });

  if (!praisePagination)
    throw new BadRequestError('Failed to paginate praise data');

  const praiseDetailsDtoList: PraiseDetailsDto[] = await Promise.all(
    praisePagination.docs.map((p) => praiseTransformer(p))
  );

  const response = {
    ...praisePagination,
    docs: praiseDetailsDtoList,
  };

  res.status(200).json(response);
};

/**
 * Fetch a single Praise
 *
 * @param {Request} req
 * @param {TypedResponse<PraiseDetailsDto>} res
 * @returns {Promise<void>}
 */
export const single = async (
  req: Request,
  res: TypedResponse<PraiseDetailsDto>
): Promise<void> => {
  const praise = await PraiseModel.findById(req.params.id).populate(
    'giver receiver forwarder'
  );
  if (!praise) throw new NotFoundError('Praise');
  const praiseDetailsDto: PraiseDetailsDto = await praiseTransformer(praise);

  res.status(200).json(praiseDetailsDto);
};

/**
 * Update a Praise.quantification's score, dismissed, duplicatePraise
 *
 * @param {TypedRequestBody<QuantificationCreateUpdateInput>} req
 * @param {TypedResponse<PraiseDto[]>} res
 * @returns {Promise<void>}
 */
export const quantify = async (
  req: TypedRequestBody<QuantificationCreateUpdateInput>,
  res: TypedResponse<PraiseDto[]>
): Promise<void> => {
  const affectedPraises = await quantifyPraise({
    id: req.params.id,
    bodyParams: req.body,
    currentUser: res.locals.currentUser,
  });

  const response = await praiseListTransformer(affectedPraises);
  res.status(200).json(response);
};

/**
 * Quantify multiple praise items
 * @param req
 * @param res
 */
export const quantifyMultiple = async (
  req: TypedRequestBody<QuantifyMultiplePraiseInput>,
  res: TypedResponse<PraiseDto[]>
): Promise<void> => {
  const { praiseIds } = req.body;

  if (!isArray(praiseIds)) {
    throw new BadRequestError('praiseIds must be an array');
  }

  const praiseItems = await Promise.all(
    praiseIds.map(async (id) => {
      const affectedPraises = await quantifyPraise({
        id,
        bodyParams: req.body,
        currentUser: res.locals.currentUser,
      });

      return affectedPraises;
    })
  );

  const response = await praiseListTransformer(praiseItems.flat());
  res.status(200).json(response);
};

const openDb = (): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
  return open({
    filename: '/tmp/database.db',
    driver: sqlite3.Database,
  });
};

const initPraiseTable = async (
  db: Database<sqlite3.Database, sqlite3.Statement>
): Promise<void> => {
  const table = await db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='praise';"
  );

  if (table.name === 'praise') {
    return;
  }

  await db.exec('BEGIN TRANSACTION');

  await db.exec(
    'CREATE TABLE IF NOT EXISTS praise (id char(24) primary key, reason text);'
  );

  const praise = await PraiseModel.find().populate('giver receiver forwarder');
  const INSERT_PRAISE = await db.prepare(
    'INSERT INTO praise (id, reason) VALUES (?,?)'
  );
  praise.forEach((p) => {
    INSERT_PRAISE.run(p._id.toString(), p.reason);
  });
  await INSERT_PRAISE.finalize();

  await db.exec('END');
};

export const exportPraise = async (
  req: Request,
  res: Response
): Promise<void> => {
  const db = await openDb();
  await initPraiseTable(db);

  const result = await db.get('SELECT count(*) as count FROM praise');
  res.status(200).json(result);

  await db.close();
};
