let express = require("express");
let router = express.Router();
const helper = require('../utilities/helper');
const saveRoleCtrl = require('../controllers/roles/save');
const listRoleCtrl = require('../controllers/roles/list');
const getoneRoleCtrl = require('../controllers/roles/getone');
router.post('/', helper.authenticateToken, listRoleCtrl.list);
router.post('/save', helper.authenticateToken, saveRoleCtrl.save);
router.post('/getone', helper.authenticateToken, getoneRoleCtrl.getone);
module.exports = router;