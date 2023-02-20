import { Slider, Tooltip } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { Theme } from '@/model/theme';

// Define two themes for @mui slider: light & dark theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...{
      primary: {
        main: '#334155',
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...{
      primary: {
        main: '#ffffff',
      },
    },
  },
});

interface ValueLabelComponentProps {
  children: JSX.Element;
  value: string;
}
const ValueLabelComponent = ({
  children,
  value,
}: ValueLabelComponentProps): JSX.Element => {
  return (
    <Tooltip
      enterTouchDelay={0}
      placement="top"
      title={value === '0' ? '0' : value}
      arrow
    >
      {children}
    </Tooltip>
  );
};

interface Mark {
  // Position of the mark within the slider widget
  value: number;

  // Actual score of the mark
  score: number;
}

const defaultMark = {
  value: 0,
  score: 0,
};
interface QuantifySliderProps {
  allowedScores: number[];
  disabled?: boolean;
  score?: number;
  onChange(number);
}

export const QuantifySlider = ({
  allowedScores,
  disabled = false,
  score = 0,
  onChange,
}: QuantifySliderProps): JSX.Element => {
  // Get theme style data for @mui slider
  const theme = useRecoilValue(Theme);

  // Mark that is *visually* selected in the UI
  const [selectedMark, setSelectedMark] = useState<Mark>(defaultMark);
  const [marks, setMarks] = useState<Mark[]>([]);

  // Define list of marks based on allowedScores
  useEffect(() => {
    const maxScore = allowedScores[allowedScores.length - 1];

    const newMarks: Mark[] = allowedScores.map((score, i) => ({
      value: Math.floor((i * maxScore) / (allowedScores.length - 1)),
      score,
    }));

    setMarks(newMarks);
  }, [allowedScores]);

  // Set initial selected mark to score prop
  useEffect(() => {
    const scoreMark = marks.find((mark) => score === mark.score);
    if (!scoreMark) return;

    setSelectedMark(scoreMark);
  }, [setSelectedMark, score, marks]);

  // Zero selected mark if disabled=true
  useEffect(() => {
    if (disabled) setSelectedMark(defaultMark);
  }, [setSelectedMark, disabled]);

  const handleOnChange = (
    event: React.SyntheticEvent | Event,
    value: number | number[]
  ): void => {
    if (Array.isArray(value)) return;

    const nearestMark = marks
      .sort((a, b) => a.value - b.value)
      .find((mark) => value <= mark.value);
    if (!nearestMark) return;

    setSelectedMark(nearestMark);
  };

  const handleOnChangeCommitted = (
    event: React.SyntheticEvent | Event,
    value: number | number[]
  ): void => {
    if (Array.isArray(value)) return;

    onChange(selectedMark.score);
  };

  const valueLabelFormat = (value: number): number =>
    allowedScores[marks.findIndex((mark) => mark.value === value)];
  const maxMarkValue = (): number =>
    marks.length > 0 ? marks[marks.length - 1].value : 0;

  return (
    <div className="inline-block w-40">
      <ThemeProvider theme={theme === 'Dark' ? darkTheme : lightTheme}>
        <Slider
          valueLabelDisplay="on"
          step={null}
          components={{ ValueLabel: ValueLabelComponent }}
          marks={marks}
          valueLabelFormat={valueLabelFormat}
          value={selectedMark.value}
          disabled={disabled}
          onChange={handleOnChange}
          onChangeCommitted={handleOnChangeCommitted}
          min={0}
          max={maxMarkValue()}
        />
      </ThemeProvider>
    </div>
  );
};
