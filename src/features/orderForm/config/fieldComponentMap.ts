import TextField from '@/components/fields/TextField.vue'
import TextareaField from '@/components/fields/TextareaField.vue'
import CheckboxField from '@/components/fields/CheckboxField.vue'
import PhoneField from '@/components/fields/PhoneField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import DateField from '@/components/fields/DateField.vue'
import FileField from '@/components/fields/FileField.vue'
import AddressField from '@/components/fields/AddressField.vue'

export const fieldComponentMap = {
    TEXT: TextField,
    TEXTAREA: TextareaField,
    CHECKBOX: CheckboxField,
    PHONE: PhoneField,
    SELECT: SelectField,
    DATE: DateField,
    FILE: FileField,
    ADDRESS_YA: AddressField
  }