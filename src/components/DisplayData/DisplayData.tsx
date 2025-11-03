import type { FC, ReactNode } from 'react';

import { RGB } from '@/components/RGB/RGB.tsx';
import { Link } from '@/components/Link/Link.tsx';
import { bem } from '@/css/bem.ts';

import './DisplayData.css';

const [, e] = bem('display-data');

export type DisplayDataRow =
  & { title: string }
  & (
  | { type: 'link'; value?: string }
  | { value: ReactNode }
  )

export interface DisplayDataProps {
  header?: ReactNode;
  footer?: ReactNode;
  rows: DisplayDataRow[];
}

export const DisplayData: FC<DisplayDataProps> = ({ header, rows }) => (
  <div>
    {header && <div>{header}</div>}
    {rows.map((item, idx) => {
      let valueNode: ReactNode;

      if (item.value === undefined) {
        valueNode = <i>empty</i>;
      } else {
        if ('type' in item) {
          valueNode = <Link to={item.value}>Open</Link>;
        } else if (typeof item.value === 'string') {
          valueNode = item.value;
        } else if (typeof item.value === 'boolean') {
          valueNode = <input type="checkbox" checked={item.value} disabled/>;
        } else {
          valueNode = item.value;
        }
      }

      return (
        <div key={idx}>
          <span>{item.title}</span>
          <span className={e('line-value')}>
            {valueNode}
          </span>
        </div>
      );
    })}
  </div>
);
