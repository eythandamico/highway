import { Combobox, MultiSelect, SearchBar, SearchToggle, Stack, Row } from '@highway/react';
const options = [{ value: 'design', label: 'Design' }, { value: 'engineering', label: 'Engineering' }];
export function FamilyModes() {
  return <Stack gap="lg">
    <Combobox label="Team" options={options} defaultValue="design" onValueChange={value => value.toUpperCase()}/>
    <Combobox multiple label="Teams" options={options} defaultValue={['design']} onValueChange={values => values.map(value => value.toUpperCase())}/>
    <MultiSelect label="Existing integration" options={options} defaultValue={['design']}/>
    <SearchBar expandable onSearch={query => query.trim()}/>
    <SearchToggle onSearch={query => query.trim()}/>
    <Stack direction="horizontal" align="center" wrap><span>One</span><span>Two</span></Stack>
    <Row><span>Existing row</span></Row>
  </Stack>;
}
