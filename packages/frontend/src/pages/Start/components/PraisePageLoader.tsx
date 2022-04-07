import LoaderSpinner from '@/components/LoaderSpinner';
import { AllPraiseQueryPagination, useAllPraiseQuery } from '@/model/praise';
import React, { useCallback, useState, useEffect } from 'react';
import { BottomScrollListener } from 'react-bottom-scroll-listener';
import { useRecoilValue } from 'recoil';
import { ALL_PRAISE_LIST_KEY } from './PraiseTable';

const PraisePageLoader = (): JSX.Element => {
  const praisePagination = useRecoilValue(
    AllPraiseQueryPagination(ALL_PRAISE_LIST_KEY)
  );
  const [nextPageNumber, setNextPageNumber] = useState<number>(
    praisePagination.currentPage + 1
  );
  const queryResponse = useAllPraiseQuery(
    {
      page: nextPageNumber,
      limit: 20,
      sortColumn: 'createdAt',
      sortType: 'desc',
    },
    ALL_PRAISE_LIST_KEY
  );
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    setLoading(false);
  }, [queryResponse]);

  const handleContainerOnBottom = useCallback(() => {
    if (loading || praisePagination.currentPage === praisePagination.totalPages)
      return;

    setLoading(true);
    setNextPageNumber(praisePagination.currentPage + 1);
  }, [praisePagination, loading, setNextPageNumber]);

  if (loading) return <LoaderSpinner />;

  /* This will trigger handleOnDocumentBottom when the body of the page hits the bottom */
  return <BottomScrollListener onBottom={handleContainerOnBottom} />;
};

export default PraisePageLoader;