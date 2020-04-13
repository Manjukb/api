const fs = require('fs');
const moment = require("moment");
const rawData = require('./raw_data');

console.log('Starting district wise data processing');
const datesArray = (from, to, interval) => {
  let ret = [];
  const fromDate = moment(from, 'DD-MM-YYYY');
  const toDate = moment(to, 'DD-MM-YYYY');
  let date = fromDate.add(interval, 'days');
  while(toDate > date) {
    ret.push(date.format('DD/MM/YYYY'));
    date = moment(date).add(interval, 'days');
  }
  return ret;
}
try {
  const StateDistrictWiseData = rawData.raw_data.reduce((acc, row) => {
    const isToday = moment().utcOffset(330).isSame(moment(row.dateannounced, "DD-MM-YYYY"), "day");
    var groupDate = row.dateannounced
    let stateName = row.detectedstate;
      if(!stateName) {
        stateName = 'Unknown';
      }
    if(!(acc[groupDate]|| {})[stateName]) {
      if(!acc[groupDate])acc[groupDate] = {}
       acc[groupDate][stateName] = {districtData: {}};
    }
    let districtName = row.detecteddistrict;
      if(!districtName) {
        districtName = 'Unknown';
      }
    if(!acc[groupDate][stateName].districtData[districtName]) {

      acc[groupDate][stateName].districtData[districtName] = {
//         active: 0,
        confirmed: 0,
//         deaths: 0,
        lastupdatedtime: "",
//         recovered: 0,
        delta: {
          confirmed: 0
        }
      };
    }
    const currentDistrict = acc[groupDate][stateName].districtData[districtName];
    if(!acc[groupDate][stateName].confirmed) acc[groupDate][stateName].confirmed= 1
    else {
      acc[groupDate][stateName].confirmed ++
    }
    currentDistrict.confirmed++;
    if (isToday) {
      currentDistrict.delta.confirmed++;
    }
    return acc;
  }, {});

let dates = datesArray(new Date("01-01-2020"), new Date(),1) //makesure no data loss for any date
let newObj = {}
  let stateDistrictWiseDataV2 = dates.map( (date, index) => {
    for (var i = index-1; i >= 1; i--) {
      if(StateDistrictWiseData[dates[i]])
      {
        Object.keys(StateDistrictWiseData[dates[i]]).map(function(state) {
          if(!newObj[date] ) newObj[date] = {}
          if(!newObj[date][state] ) newObj[date][state] = {total:0}
          newObj[date][state].total += StateDistrictWiseData[dates[i]][state].confirmed
        })
      }
    }
  });
  fs.writeFileSync('day_wise_state_total_count.json', JSON.stringify(newObj, null, 2));
  console.log('Starting district wise data processing ...done');
} catch(err) {
  console.log('Error processing district wise data', err);
}
