import { useState } from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { colors } from '../theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, onFocus, onBlur, multiline, editable, ...inputProps }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const border = error ? 'border-red-400' : focused ? 'border-amber-600' : 'border-stone-300';
  const readOnly = editable === false;

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-stone-700 mb-1.5">{label}</Text>
      <TextInput
        className={`border rounded-xl px-3.5 py-3 text-base ${border} ${
          readOnly ? 'bg-stone-100 text-stone-500' : 'bg-white text-stone-900'
        } ${multiline ? 'min-h-[80px]' : ''}`}
        placeholderTextColor={colors.placeholder}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        editable={editable}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...inputProps}
      />
      {error ? <Text className="text-xs text-red-600 mt-1">{error}</Text> : null}
    </View>
  );
}
