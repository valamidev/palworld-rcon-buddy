export const parseCSV = (csvData: any) => {
  const lines = csvData.trim().split("\n");
  const headers = lines
    .shift()
    .split(",")
    .map((header: any) => header.trim());
  const result = lines.map((line: any) => {
    const values = line.split(",").map((value: any) => value.trim());
    return headers.reduce((object: any, header: any, index: any) => {
      object[header] = values[index];
      return object;
    }, {});
  });
  return result;
};
