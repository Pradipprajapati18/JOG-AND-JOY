import * as mockApi from '../mockApi';

const TABLE = 'orders';

export const ordersApi = {
  list: (params) => mockApi.list(TABLE, params),
  get: (id) => mockApi.get(TABLE, id),
  create: (payload) => mockApi.create(TABLE, payload),
  update: (id, patch) => mockApi.update(TABLE, id, patch),
  remove: (id) => mockApi.remove(TABLE, id),
};
