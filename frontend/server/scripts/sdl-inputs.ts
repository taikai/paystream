import { DMMF } from '@prisma/client/runtime';

interface OptionsType {
  dmmf: DMMF.Document;
  excludeFields?: string[];
  filterInputs?: (input: DMMF.InputType) => DMMF.SchemaArg[];
  doNotUseFieldUpdateOperationsInput?: boolean;
}

const testedTypes: string[] = [];

const hasEmptyTypeFields = (type: string, options: OptionsType) => {
  const schema = options?.dmmf.schema;

  testedTypes.push(type);
  const inputObjectTypes = schema ? [...schema.inputObjectTypes.prisma] : [];
  if (schema.inputObjectTypes.model)
    inputObjectTypes.push(...schema.inputObjectTypes.model);

  const inputType = inputObjectTypes.find(item => item.name === type);
  if (inputType) {
    if (inputType.fields.length === 0) return true;
    for (const field of inputType.fields) {
      const fieldType = getInputType(field, options);
      if (
        fieldType.type !== type &&
        fieldType.location === 'inputObjectTypes' &&
        !testedTypes.includes(fieldType.type as string)
      ) {
        const state = hasEmptyTypeFields(fieldType.type as string, options);
        if (state) return true;
      }
    }
  }
  return false;
};

const getInputType = (
  field: DMMF.SchemaArg,
  options?: { doNotUseFieldUpdateOperationsInput?: boolean }
) => {
  let index: number = 0;
  if (
    options?.doNotUseFieldUpdateOperationsInput &&
    field.inputTypes.length > 1 &&
    (field.inputTypes[1].type as string).endsWith('FieldUpdateOperationsInput')
  ) {
    return field.inputTypes[index];
  }
  if (
    field.inputTypes.length > 1 &&
    (field.inputTypes[1].location === 'inputObjectTypes' ||
      field.inputTypes[1].isList ||
      field.inputTypes[1].type === 'Json')
  ) {
    index = 1;
  }
  return field.inputTypes[index];
};

function generateInputsString(options: OptionsType) {
  const schema = options?.dmmf.schema;
  let fileContent = `
  scalar DateTime
  
  type BatchPayload {
  count: Int!
}
`;
  if (schema) {
    const enums = [...schema.enumTypes.prisma];
    if (schema.enumTypes.model) enums.push(...schema.enumTypes.model);
    enums.forEach(item => {
      fileContent += `enum ${item.name} {`;
      item.values.forEach(item2 => {
        fileContent += `
        ${item2}`;
      });
      fileContent += `}
  
  `;
    });
    const inputObjectTypes = [...schema.inputObjectTypes.prisma];
    if (schema.inputObjectTypes.model)
      inputObjectTypes.push(...schema.inputObjectTypes.model);

    inputObjectTypes.forEach(input => {
      const inputFields =
        typeof options?.filterInputs === 'function'
          ? options.filterInputs(input)
          : input.fields;

      if (inputFields.length) {
        fileContent += `input ${input.name} {
      `;
        inputFields
          .filter(field => !options?.excludeFields?.includes(field.name))
          .forEach(field => {
            const inputType = getInputType(field, options);
            const hasEmptyType =
              inputType.location === 'inputObjectTypes' &&
              hasEmptyTypeFields(inputType.type as string, options);
            if (!hasEmptyType) {
              fileContent += `${field.name}: ${
                inputType.isList ? `[${inputType.type}!]` : inputType.type
              }${field.isRequired ? '!' : ''}
        `;
            }
          });
        fileContent += `}
    
  `;
      }
    });
  }
  return fileContent;
}

export const sdlInputs = (options: OptionsType) => {
  const gql = require('graphql-tag');
  const generatedInputsString = generateInputsString(options);
  return gql`
    ${generatedInputsString}
  `;
};
