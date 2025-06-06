import React, { ChangeEvent, useState } from 'react';
import { KTSVG } from '../../_metronic/helpers';
import { useIntl } from 'react-intl';

interface Action {
  key: string;
  label: string;
  onExecute: () => Promise<void>;
}

export interface SelectedItemsActionsProps {
  selectedCount: number;
  selectionMessage: (count: number) => string;
  actions: Action[];
}

export const SelectedItemsActions: React.FC<SelectedItemsActionsProps> = ({
  selectedCount,
  selectionMessage,
  actions,
}) => {
  const intl = useIntl();
  const [action, setAction] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  if (selectedCount === 0) return null;

  return (
    <div className="d-flex align-items-center mb-5">
      <div className="d-flex align-items-center">
        <KTSVG path="/media/icons/duotune/general/gen043.svg" className="svg-icon-2 me-2 text-primary" />
        <span className="text-gray-600">{selectionMessage(selectedCount)}</span>
      </div>
      <div className="d-flex align-items-center ms-3">
        <select
          className="form-select form-select-sm w-180px"
          value={action}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setAction(e.target.value)}
        >
          <option value="">{intl.formatMessage({ id: 'SELECTED_ITEMS_ACTIONS.SELECT_ACTION' })}</option>
          {actions.map((action) => (
            <option key={action.key} value={action.key}>
              {action.label}
            </option>
          ))}
        </select>
        <button
          className="btn btn-sm btn-primary ms-3 w-150px"
          onClick={() => {
            setLoading(true);
            actions
              .find((a) => a.key === action)
              ?.onExecute()
              .finally(() => setLoading(false));
          }}
          disabled={!action || loading}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            intl.formatMessage({ id: 'SELECTED_ITEMS_ACTIONS.EXECUTE' })
          )}
        </button>
      </div>
    </div>
  );
};
