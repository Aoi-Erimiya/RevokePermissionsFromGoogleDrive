/**
 *  autoRevokePermissions.gs
 *
 *  Copyright (c) 2020 Hiroaki Wada(Gentle)
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 * 
 *  see https://developers.google.com/apps-script/reference/drive/drive-app
 */

/**
 * FolderIteratorとFileIteratorを保持するクラス
 * 
 * @param {FileIterator} FileIterator
 * @param {FolderIterator} FolderIterator
 */
class DriveIteratorTuple {
    constructor(fileIterator, folderIterator) {
      this.fileIterator = fileIterator;
      this.folderIterator = folderIterator;
    }

    fileIterator() { return this.fileIterator; }
    folderIterator() { return this.folderIterator; }
}

/**
 * FolderIteratorを取得する
 *
 * @param {Folder} Folder
 * @return {DriveIteratorTuple} DriveIteratorTuple
 */
function getDriveIteratorTupleByFolder(folder){
    return new DriveIteratorTuple(folder.getFiles(), folder.getFolders());
}

/**
 * フォルダ配下のDriveIteratorTupleリストを取得する
 *
 * @param {FolderIterator} FolderIterator
 */
function getDriveIteratorTuplesByFolderIterator(folderIterator){
    const driveIteratorTuples = [];
  
    while(folderIterator.hasNext()){
        var folder = folderIterator.next();
        driveIteratorTuples.push(getDriveIteratorTupleByFolder(folder));
    }
    return driveIteratorTuples;
}

/**
 * ファイル毎に設定されたアクセス権限を全削除する
 *
 * @param {FileIteratorator} FileIteratorator
 */
function revokePermissionsByFileIterator(fileIterator){
    while(fileIterator.hasNext()){
        const file = fileIterator.next();
        const users = file.getEditors().concat(file.getViewers());
        const distinctUsers = users.filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });
        Logger.log('removed File:' + file.getName() + '/users:' + distinctUsers.length);
        
        for(const user of distinctUsers){
            driveFile.revokePermissions(user);
        }
    }
}

/**
 * ディレクトリ配下のファイルのアクセス権限削除(再帰)
 *
 * @param {DriveIteratorTuple} 削除対象のDriveIteratorTuple
 */
function revokePermissionsByDriveIteratorTuple(driveIteratorTuple){
    revokePermissionsByFileIterator(driveIteratorTuple.fileIterator);
    const tuples = getDriveIteratorTuplesByFolderIterator(driveIteratorTuple.folderIterator);
    for(const tuple of tuples){
        revokePermissionsByDriveIteratorTuple(tuple);
    }
}

/**
 * 指定ディレクトリ以下のアクセス権限を全削除する
 *
 * @param {string} GoogleDriveディレクトリID
 */
function revokeByFolderId(folderId){
    const rootFolder = DriveApp.getFolderById(folderId);
    const rootTuple = getDriveIteratorTupleByFolder(rootFolder);

    revokePermissionsByDriveIteratorTuple(rootTuple);
}
