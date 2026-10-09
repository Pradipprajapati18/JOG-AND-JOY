import * as mockApi from '../mockApi';

const TABLE = 'categories';

const DEFAULT_CATEGORIES = [
  { id: 'def_1', label: 'Kids T-shirt', section: 'kids' },
  { id: 'def_2', label: 'Kids joggers and tracks', section: 'kids' },
  { id: 'def_3', label: 'Kids shorts and bermudas', section: 'kids' },
  { id: 'def_4', label: 'Kids night suits', section: 'kids' },
  { id: 'def_5', label: 'Kids pajama suits', section: 'kids' },
  { id: 'def_6', label: 'Men tracks and joggers', section: 'mens' },
  { id: 'def_7', label: 'Men shorts and bermuda', section: 'mens' },
  { id: 'def_8', label: 'Men boxers', section: 'mens' },
  { id: 'def_9', label: 'Girl frocks', section: 'kids' },
];

export const categoriesApi = {
  list: (params) => mockApi.list(TABLE, params),
  get: (id) => mockApi.get(TABLE, id),
  create: (payload) => mockApi.create(TABLE, payload),
  update: (id, patch) => mockApi.update(TABLE, id, patch),
  remove: (id) => mockApi.remove(TABLE, id),
};
