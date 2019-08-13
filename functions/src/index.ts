// Google Cloud Function Handler for Celesitial Components handling CRUD activities.
// Example of this would be to add/delete/update minerals or ore within the primary database.
// -kareemjg @ 6/14/2019

//******************************************************************************************/
//****************************** IMPORTS & DECLARATIONS ************************************/
//******************************************************************************************/
import * as functions from 'firebase-functions';
import { logIt} from "./logger";
import { myVariables} from "./myVariables";
import { testComponents, addComponentsToDatabase, updateSingleComponentInDatabase, getComponentInfoByID , getListOfComponents} from './crudComponents';
import { getUserAccounts } from './crudUsers';
import * as sentry from "@sentry/node";


// Initialize Sentry.IO Exeception Logging
sentry.init({ dsn: myVariables.SENTRY_DSN });



logIt(myVariables.LOG_INFO,'Functions App Running.');

//******************************************************************************************/
//****************************** FIREBASE EXPORTS ***** ************************************/
//******************************************************************************************/
exports.testCelestialComponentsDB = functions.https.onRequest(testComponents);

exports.componentsAddToDB = functions.https.onRequest(addComponentsToDatabase);
exports.componentsUpdateInDB = functions.https.onRequest(updateSingleComponentInDatabase);
exports.componentsLoadByID = functions.https.onRequest(getComponentInfoByID);
exports.componentsLoadList = functions.https.onRequest(getListOfComponents);

exports.adminGetAllUsers = functions.https.onRequest(getUserAccounts);
