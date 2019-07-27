import { sha256 } from 'js-sha256';
/*
 * convert string combo into unqiue id.
 */
export function makeDBKey(dataPoint1:any, dataPoint2:any, dataPoint3:any) {
    let  _dataPoint1 = "";
    let  _dataPoint2 = "";
    let  _dataPoint3 = "";

    if (dataPoint1 !== "") {_dataPoint1 = dataPoint1}
    if (dataPoint2 !== "") {_dataPoint2 = dataPoint2}
    if (dataPoint3 !== "") {_dataPoint3 = dataPoint3}

    return sha256(_dataPoint1 + _dataPoint2 + _dataPoint3);
};

/**
 * Check is value is either Null or Undefined
 * @param value
 */
export function checkIfNull(value: any) : boolean {

    let isNull = false;

    if (value == null) {
        isNull = true;
    }

    if (value === null) {
        isNull = true;
    }

    if (typeof value === 'undefined') {
        isNull = true;
    }

    return isNull;
}