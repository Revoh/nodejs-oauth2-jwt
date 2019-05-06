'use strict';
const env = require('../../lib/config/knexfile');
const db = require('knex')(env.development);
const crypto = require('crypto')


let userDatas = [];


class User {
  constructor(id, username, password){
    this.id = id;
    this.username = username;
    this.password = password;
  }

  isValidPassword(password){
    let hashedPassword = crypto.createHash('md5').update(password).digest("hex");
    return this.password === hashedPassword;
  }
}

async function findByUsername(username, cb){
  let userData = '';
   userDatas = await db.from('users');
  for(let i = 0 ; i < userDatas.length ; i++){
    if(userDatas[i].userName === username){
      userData = userDatas[i];
      break;
    }
  }
  
  let user =  new User(userData.userId, userData.userName, userData.password);
  cb(user);
}

async function  findById(id, cb){
  userDatas = await db.from('users');
  let userData = '';
  for(let i=0;i<userDatas.length;i++){
    if(userDatas[i].userId == id){
      userData = userDatas[i];
      break;
    }

  }
  console.log(userData);
  let user =  new User(userData.userId, userData.username, userData.password);
  cb(user);
};

async function getUserRoles(id,cb){
  let userRole = await db({ r: 'roles', ur: 'user_role',u: 'users' })
  .select({
    role: 'r.roleName'
  })
  .andWhereRaw('?? = ??', ['r.roleId', 'ur.roleId'])
  .andWhereRaw('?? = ??', ['ur.userId', 'u.userId'])
  .where({'ur.userId':id})

  cb(userRole);
}

async function getAccessMenu(id,cb){
  let accessMenu = await db({ t: 'tasks', m: 'menu', rt: 'role_task', ur: 'user_role' })
  .select({
    taskId: 't.taskId',
    taskName: 't.taskName',
    childLink: 't.link',
    childIcon: 't.icon',
    menuId: 'm.menuId',
    mainMenu: 'm.name',
    mainMenuLink : 'm.link',
    mainMenuIcon : 'm.icon'    
  })
  .whereRaw('?? = ??', ['m.menuId', 't.menuId'])
  .whereRaw('?? = ??', ['rt.taskId', 't.taskId'])
  .whereRaw('?? = ??', ['ur.roleId', 'rt.roleId'])
  .where({'ur.userId':id})

  console.log(accessMenu);
  var menu_to_values = accessMenu.reduce((obj, item)=>{
    obj[item.mainMenu] = obj[item.mainMenu] || [];
    obj[item.mainMenu].push({label:item.taskName,link:item.childLink,icon:item.childIcon});
    return obj;
}, {});
 
var menus = Object.keys(menu_to_values).map((key)=>{
  let menu = accessMenu.find(i => i.mainMenu === key);
  return {menu: key,link:menu.mainMenuLink,icon:menu.mainMenuIcon, subMenu: menu_to_values[key]};
});
  cb(menus);
}


module.exports = {
  findById: findById,
  findByUsername: findByUsername,
  getUserRoles: getUserRoles,
  getAccessMenu:getAccessMenu
};
