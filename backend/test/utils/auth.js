const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const userFilePath = path.join(__dirname, "../test_data/users.json");
const users = JSON.parse(fs.readFileSync(userFilePath, "utf8"));

function generateAuthInfoForUsername(username) {
    const user = users.find(user => user.username === username);
    if (!user) {
        throw new Error("User not found");
    }

    const payload = {
        userId: user['_id']?.['$oid'],
        roleId: user['roleId']?.['$oid'],
        adminId: user['adminId']?.['$oid']
    };

    user._id = payload.userId;
    user.roleId = payload.roleId;
    user.adminId = payload.adminId;

    return { token: jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }), user };
}

module.exports = { generateAuthInfoForUsername };