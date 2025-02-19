import { classNames } from '../../utils/';

type PageVariant = '' | 'wide';

interface PageProps {
  variant?: PageVariant;
  className?: string;
  ref?: React.MutableRefObject<null>;
  children?:
    | JSX.Element
    | string
    | (string | JSX.Element)[]
    | string[]
    | JSX.Element[];
}

export const Page = ({
  variant,
  className,
  ref,
  children,
}: PageProps): JSX.Element => {
  const defaultClass = 'w-full px-0 py-5 md:px-5';
  const regularClass = `md:w-[750px] ${defaultClass}`;
  const wideClass = `md:w-[750px] xl:w-[1000px] ${defaultClass}`;

  const variantClass = variant === '' || !variant ? regularClass : wideClass;

  return (
    <div className={classNames(variantClass, className)} ref={ref}>
      {children}
    </div>
  );
};
