import { PraiseDto } from '@/model/praise/praise.dto';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRecoilValue } from 'recoil';
import { Notice } from '@/components/ui/Notice';
import { Praise } from '@/components/praise/Praise';
import { ActiveUserId } from '@/model/auth/auth';
import {
  findPraiseQuantification,
  shortenDuplicatePraise,
} from '@/utils/praise';
import { classNames } from '@/utils/index';
import { QuantifySlider } from './QuantifySlider';

interface Props {
  praise: PraiseDto;
  periodId: string;
  usePseudonyms: boolean;
  allowedValues: number[];
  checked?: boolean;
  onToggleCheck();
  onSetScore(newScore: number);
  onDuplicateClick();
}

export const QuantifyPraiseRow = ({
  praise,
  periodId,
  usePseudonyms,
  allowedValues,
  checked = false,
  onToggleCheck,
  onSetScore,
  onDuplicateClick,
}: Props): JSX.Element | null => {
  const userId = useRecoilValue(ActiveUserId);
  if (!userId) return null;

  const quantification = findPraiseQuantification(praise, userId);
  if (!quantification) return null;

  const dismissed = quantification.dismissed;
  const duplicate = !!quantification.duplicatePraise;

  return (
    <tr
      className={classNames(
        'group',
        checked ? 'bg-warm-gray-100 dark:bg-slate-500' : ''
      )}
    >
      <td className="pl-5 pr-5">
        <input type="checkbox" checked={checked} onChange={onToggleCheck} />
      </td>
      <td className="py-3 pr-5">
        <Praise
          praise={praise}
          showIdPrefix={true}
          showReceiver={false}
          periodId={periodId}
          usePseudonyms={usePseudonyms}
          dismissed={dismissed}
          shortDuplicatePraise={shortenDuplicatePraise(praise, userId)}
          bigGiverAvatar={false}
          showScore={false}
        />
      </td>
      <td className="pr-5">
        {duplicate ? (
          <Notice type="info" className="w-40 py-2">
            <>
              Duplicate score: <br />
              {quantification.scoreRealized}
            </>
          </Notice>
        ) : (
          <QuantifySlider
            allowedScores={allowedValues}
            score={quantification.scoreRealized}
            disabled={dismissed || duplicate}
            onChange={onSetScore}
          />
        )}
      </td>
      <td className="pr-5">
        <div className="w-3">
          <button
            className="hidden cursor-pointer text-warm-gray-400 group-hover:block hover:text-warm-gray-500"
            disabled={duplicate}
            onClick={onDuplicateClick}
          >
            <FontAwesomeIcon icon={faCopy} size="1x" />
          </button>
        </div>
      </td>
    </tr>
  );
};
