export const db = {
  query: jest.fn().mockResolvedValue({ rows: [] }),
};
export const healthcheck = jest.fn().mockResolvedValue(true);
