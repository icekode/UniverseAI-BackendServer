// Firebase Function Handler for User Information.
// This will be able to get Firebase User information List or lookup via email or ID.
// -thisiskareemg @ 8/13/2019

//******************************************************************************************/
//****************************** IMPORTS & DECLARATIONS ************************************/
//******************************************************************************************/

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
//import * as sentry from "@sentry/node";
import { myVariables} from "./myVariables";
import { logIt} from "./logger";

const dataTemplate = {'data' : '', 'message' : '', 'status' : '', 'function' : ''};


//******************************************************************************************/
//******************************         EXPORTS        ************************************/
//******************************************************************************************/

/**
 * Get User Accounts from Firebase Database
 * @param req
 * @param res
 */
export function getUserAccounts(req: functions.Request, res: functions.Response) {

    logIt(myVariables.LOG_INFO, 'getUserAccounts initiated');
    const nextPageToken = '1'; // Need to incorporate this into the response string

    const getUsers = listAllUsers(nextPageToken);

    getUsers
        .then(users => {
            res.status(myVariables.API_OKAY).send(users);
        })
        .catch(error => {
            logIt(myVariables.LOG_ERROR, error);
            res.status(myVariables.API_ERROR).send(error);
        })

}

//******************************************************************************************/
//******************************         INTERNAL FUNCTIONS        *************************/
//******************************************************************************************/

/**
 * List all users.
 * @param nextPageToken
 */
function listAllUsers(nextPageToken : string) {
    const data = dataTemplate;

    logIt(myVariables.LOG_INFO, 'listAllUsers initiated');

    return new Promise(function (resolve, reject) {
        admin.auth().listUsers(1000, nextPageToken)
            .then(function (listUsersResult) {
                listUsersResult.users.forEach(function (userRecord) {
                    data.data = userRecord.toString();
                    resolve(data);
                });
                if (listUsersResult.pageToken) {
                    // List next batch of users.
                    //TODO this code is broken once we get past 1000 users
                    data.data = listUsersResult.pageToken;
                    data.message = "new_token";
                    resolve(data);
                }
            })
            .catch(function (error) {
                logIt(myVariables.LOG_ERROR, error);
                reject(error);
            });
    })
};
