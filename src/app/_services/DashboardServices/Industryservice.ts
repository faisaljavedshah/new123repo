import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Industryservice {
  finalArr = [];
  sampleObject = {};
  downloadFile(data, filename = 'data') {
    console.log('CSV data=====>', data);

    data.forEach(element => {
      console.log(element);

      this.sampleObject = {};
      if (element.to || element.width != 15) {
        this.sampleObject['Industry Group'] = element.from;
      } else {
        this.sampleObject['Industry Group'] = '';
      }
      if (element.to) {
        this.sampleObject['Industry Name'] = element.to.split('(')[0];
      } else {
        this.sampleObject['Industry Name'] = '';
      }
      if (element.to && element.width != 15) {
        this.sampleObject['Calls'] = element.to_count;
      } else {
        this.sampleObject['Calls'] = 0;
      }
      if (element.to || element.width != 15) {
        this.finalArr.push(this.sampleObject);
      }
    });
    let csvData = this.ConvertToCSV(this.finalArr, [
      'Industry Group',
      'Industry Name',
      'Calls'
    ]);
    let blob = new Blob(['\ufeff' + csvData], {
      type: 'text/csv;charset=utf-8;'
    });
    let dwldLink = document.createElement('a');
    let url = URL.createObjectURL(blob);
    let isSafariBrowser =
      navigator.userAgent.indexOf('Safari') != -1 &&
      navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
      //if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', filename + '.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
    this.finalArr = [];
  }

  ConvertToCSV(objArray, headerList) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = 'S.No,';

    for (let index in headerList) {
      row += headerList[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = i + 1 + '';
      for (let index in headerList) {
        let head = headerList[index];

        line += ',' + array[i][head];
      }
      str += line + '\r\n';
    }
    return str;
  }
}
