/**
 *  autoRevokePermissions.js
 *
 *  Copyright (c) 2020 Hiroaki Wada(Gentle)
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */


class DriveItrTuple {
    constructor(fileIterator, folderIterator) {
      this.fileIterator = fileIterator;
      this.folderIterator = folderIterator;
    }

    fileIterator() { return this.fileIterator; }
    folderIterator() { return this.folderIterator; }
}

function getDriveItrTupleByDir(folder){
    return new DriveItrTuple(folder.getFiles(), folder.getFolders());
}

/**
 * フォルダ配下のDriveItrTupleリストを取得する
 *
 * @param {string} FolderIterator
 */
function getDriveItrTuplesByFolderIterator(folderIterator){
    let driveItrTuples = [];
  
    while(folderIterator.hasNext()){
        var folder = folderIterator.next();
        driveItrTuples.push(getDriveItrTupleByDir(folder));
    }
    return driveItrTuples;
}

/**
 * ファイル毎に設定されたアクセス権限を全削除する
 *
 * @param {string} FileItrator
 */
function revokePermissionsByFileItr(fileIterator){
    while(fileIterator.hasNext()){
        let file = fileIterator.next();
        let users = file.getEditors().concat(file.getViewers());
        let distinctUsers = users.filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });
        Logger.log('removed File:' + file.getName() + '/users:' + distinctUsers.length);
        
        for(let user of distinctUsers){
            driveFile.revokePermissions(user);
        }
    }
}

/**
 * ディレクトリ配下のファイルのアクセス権限削除(再帰)
 *
 * @param {string} DriveItrTuple
 */
function revokePermissionsByDriveItrTuple(driveItrTuple){
    revokePermissionsByFileItr(driveItrTuple.fileIterator);
    const tuples = getDriveItrTuplesByFolderIterator(driveItrTuple.folderIterator);
    for(let tuple of tuples){
        revokePermissionsByDriveItrTuple(tuple);
    }
}

/**
 * 指定ディレクトリ以下のアクセス権限を全削除する
 *
 * @param {string} GoogleDriveディレクトリID
 */
function revokeByDirId(folderId){
    let rootDir = DriveApp.getFolderById(folderId);
    let rootTuple = getDriveItrTupleByDir(rootDir);

    revokePermissionsByDriveItrTuple(rootTuple);
}
