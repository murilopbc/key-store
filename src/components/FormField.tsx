import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, ...inputProps }: FormFieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-stone-600 mb-1">{label}</Text>
      <TextInput
        className={`bg-white border rounded-lg p-3 ${
          error ? 'border-red-400' : 'border-stone-300'
        }`}
        placeholderTextColor="#a8a29e"
        {...inputProps}
      />
      {error ? <Text className="text-xs text-red-600 mt-1">{error}</Text> : null}
    </View>
  );
}
