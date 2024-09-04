import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import { ServerContext } from '../../context';
import { Add } from '@mui/icons-material';
import { TODO, guessValueType } from '@the-libs/base-shared';
import { axiosErrorToaster, IconColorer, OFAB } from '../../utils';

import type { Document as MDocument, Types } from 'mongoose';

type ActionModal<D> = (
  closeModal: () => void,
  id?: string,
  theItem?: D,
) => ReactNode;

export interface GenericTableProps<D> {
  endpoint?: string;
  readyData?: D[];
  customColumns?: { path: string[]; name: string }[];
  actions: {
    name: string;
    icon: ReactNode;
    modal: ActionModal<D>;
  }[];
  fab?: {
    modal: ActionModal<D>;
  };
  customRowId?: string;
}

const autoSumColumn = (dataArray: TODO[]) => {
  const res = new Set<string>();
  dataArray?.forEach((elm) => Object.keys(elm).forEach((key) => res.add(key)));
  return [...res];
};

export const GenericTable = <D extends MDocument<Types.ObjectId>>({
  endpoint,
  readyData,
  customColumns,
  actions,
  fab,
  customRowId,
}: GenericTableProps<D>) => {
  const [data, setData] = useState<D[]>([]);
  const server = useContext(ServerContext);
  const [openModal, setOpenModal] = useState<number>();
  const [selectedId, setSelectedId] = useState('');

  const fetchData = useCallback(async () => {
    try {
      if (server) {
        let data;
        if (endpoint) data = (await server.axiosInstance.get(endpoint)).data;
        else data = readyData;
        setData(data ? data : data);
      }
    } catch (e) {
      axiosErrorToaster(e);
    }
  }, [server, endpoint, readyData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const closeModal = () => {
    setOpenModal(undefined);
    fetchData();
  };

  const columns =
    customColumns ||
    autoSumColumn(data).map((key) => ({
      path: [key],
      name: key,
    }));

  return (
    <Box overflow="scroll">
      {openModal !== undefined && openModal === -1
        ? fab?.modal(closeModal, selectedId)
        : actions[openModal as number] &&
          actions[openModal as number].modal(
            closeModal,
            selectedId,
            data.find(({ _id }) => String(_id) === selectedId),
          )}
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(({ name }) => (
              <TableCell sx={{ fontWeight: 'bold',overflow: 'hidden',textOverflow: 'ellipsis',whiteSpace: 'nowrap',
                fontSize: 'clamp(0.8rem, 1.5vw + 0.1rem, 1.4rem)'
               }}
               key={name}>{name}
               </TableCell>
            ))}
            {actions?.map(({ name }) => (
              <TableCell sx={{ fontWeight: 'bold', fontSize: 'clamp(0.8rem, 1.5vw + 0.1rem, 1.4rem)' }} key={name}>
                {name}
                </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((row, i) => (
            <TableRow key={i}>
              {columns
                .map(({ path }) => {
                  let data = row;
                  path.forEach(
                    (key) =>
                      (data = (data as TODO)
                        ? (data as TODO)[key]
                        : (data as TODO)),
                  );
                  return data;
                })
                .map((value, j) => (
                  <TableCell sx={{ fontSize: {
                    sm: '0.7rem',
                    md: '0.8rem',
                    xl: '1rem'
                  }}} key={`${i}-${j}`}>
                    {(Array.isArray(value) ? value : [value])
                      .map((item) => guessValueType(item))
                      .join(', ')}
                  </TableCell>
                ))}
              {actions.map(({ icon }, i) => (
                <TableCell key={i}>
                  <IconButton
                    onClick={() => {
                      setOpenModal(i);
                      setSelectedId(
                        (row as TODO)[customRowId || '_id'].toString(),
                      );
                    }}
                  >
                    <IconColorer>{icon}</IconColorer>
                  </IconButton>
                </TableCell>
              ))}
            </TableRow>
          ))}
          {fab && (
            <OFAB onClick={() => setOpenModal(-1)}>
              <IconColorer>
                <Add />
              </IconColorer>
            </OFAB>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};
