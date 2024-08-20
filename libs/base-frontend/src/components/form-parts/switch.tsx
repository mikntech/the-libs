import {
  FormControlLabel,
  Grid,
  styled,
  Switch,
  ToggleButton,
  toggleButtonClasses,
  Typography,
} from '@mui/material';
import { TODO } from '@base-shared';
import { Dispatch, ReactNode, SetStateAction } from 'react';

interface Options {
  label?: { truthy: string; falsy?: string };
  negative?: boolean;
  customValue?: boolean;
  disable?: boolean;
}

export const renderToggleButton = <T,>(
  formState: T,
  handleChange: (path: string[], value: string | Date | boolean) => void,
  path: string[],
  options: Options,
) => {
  let val: TODO = formState;

  path.forEach((key) => {
    if (val === true || val === false || val === undefined) return;
    if (Array.isArray(val)) {
      val = val.includes(key);
    } else {
      val = val[key];
    }
  });

  const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
    [`&.${toggleButtonClasses.root}`]: {
      borderRadius: '30px',
      fontFamily: 'Open Sans',
      fontSize: '12px',
      lineHeight: '20px',
      fontWeight: '600',
      letterSpacing: '0.1px',
      fontStyle: 'normal',
      paddingBlock: '8px',
      paddingInline: '10.5px',
      backgroundColor: '#76777A',
    },
    [`&.${toggleButtonClasses.selected}`]: {
      backgroundColor: '#005FAF',
    },
  }));

  const value = options.customValue === undefined ? !!val : options.customValue;
  return (
    <StyledToggleButton
      value={path[path.length - 1]}
      selected={options?.negative ? !value : value}
      onChange={(e: TODO) => {
        handleChange(
          path,
          options?.negative
            ? e.target.ariaPressed === 'true'
            : e.target.ariaPressed !== 'true',
        );
      }}
    >
      <span>
        {(value ? options?.label?.truthy : options?.label?.falsy) ||
          options?.label?.truthy}
      </span>
    </StyledToggleButton>
  );
};

export const renderSwitch = <T,>(
  formState: T,
  handleChange: (path: string[], value: string | Date | boolean) => void,
  path: string[],
  options: Options,
) => {
  let val: TODO = formState;

  path.forEach((key) => {
    if (val === true || val === false || val === undefined) return;
    if (Array.isArray(val)) {
      val = val.includes(key);
    } else {
      val = val[key];
    }
  });

  const value = options.customValue === undefined ? !!val : options.customValue;
  return (
    <FormControlLabel
      sx={(theme) => ({ color: theme.palette.secondary.main })}
      control={
        <Switch
          disabled={options?.disable}
          checked={options?.negative ? !value : value}
          onChange={(e: TODO) => {
            handleChange(
              path,
              options?.negative ? !e.target.checked : e.target.checked,
            );
          }}
          name={path[path.length - 1]}
        />
      }
      label={
        (value ? options?.label?.truthy : options?.label?.falsy) ||
        options?.label?.truthy
      }
    />
  );
};

export const renderSwitchGroup = <T, S>(
  formState: T,
  pathToArray: string[],
  label: string,
  setFormState: {
    setter: Dispatch<SetStateAction<T>>;
    postSetStateCb?: () => void;
    signal?: boolean;
  },
  options: {
    value: string;
    label: string;
  }[],
  anotherComponent: ((value: string) => ReactNode) | undefined = undefined,
  CustomTypography = Typography,
) => (
  <Grid
    item
    container
    justifyContent="center"
    alignItems="center"
    rowSpacing={2}
    direction="column"
  >
    <Grid item>
      <CustomTypography>{label}:</CustomTypography>
    </Grid>
    <Grid
      item
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      rowSpacing={2}
    >
      {options.map(({ value, label: switchLabel }) => {
        let array: TODO = formState;
        pathToArray.forEach((key) => {
          array = array ? array[key] : undefined;
        });
        const isChecked = array?.some((item: string | { name: string }) =>
          anotherComponent
            ? (item as { name: string }).name === value
            : item === value,
        );
        const switchComponent = renderSwitch(
          formState,
          ((_: keyof T, newValue: boolean) => {
            setFormState.setter((prevState: T) => {
              const newState: TODO = { ...prevState };
              let targetArray: S = newState;
              pathToArray.slice(0, -1).forEach((key) => {
                if (!(targetArray as TODO)[key])
                  (targetArray as TODO)[key] = {};
                targetArray = (targetArray as TODO)[key];
              });
              const finalKey = pathToArray[pathToArray.length - 1];
              if (!Array.isArray((targetArray as TODO)[finalKey]))
                (targetArray as TODO)[finalKey] = [];
              if (newValue) {
                if (
                  !(targetArray as TODO)[finalKey].some(
                    (item: string | { name: string }) =>
                      anotherComponent
                        ? (item as { name: string }).name === value
                        : item === value,
                  )
                ) {
                  (targetArray as TODO)[finalKey].push(
                    anotherComponent ? { name: value } : value,
                  );
                }
              } else {
                (targetArray as TODO)[finalKey] = (targetArray as TODO)[
                  finalKey
                ].filter(
                  (item: string | { name: string }) =>
                    ((item as { name: string }).name ||
                      (item as { name: string })) !== value,
                );
              }
              return newState;
            });
            setFormState.postSetStateCb && setFormState.postSetStateCb();
          }) as TODO,
          [value],
          {
            label: { truthy: switchLabel },
            customValue: isChecked,
            disable: setFormState.signal,
          },
        );
        return (
          <Grid
            key={value}
            item
            container={!!anotherComponent}
            alignItems="center"
          >
            {anotherComponent ? (
              <>
                <Grid item>{switchComponent}</Grid>
                <Grid item>{anotherComponent(value)}</Grid>
              </>
            ) : (
              switchComponent
            )}
          </Grid>
        );
      })}
    </Grid>
  </Grid>
);
