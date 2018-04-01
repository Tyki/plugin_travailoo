module.exports = {
  'document:afterUpdate': 'updateCache',
  'document:afterDelete': 'updateCache',
  'document:afterCreate': 'updateCache'
}
