import { Component, OnInit } from '@angular/core';
import {ITimeCard} from "../../interfaces/ITimeCard";
import {IUser} from "../../interfaces/IUser";

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {

  //region Class Variables

  public pieData: PieChartData[] = [];
  public pieTitle = "Hours Per Member"

  public lineData: LineChartData[] = [];
  public lineTitle = "Hours per Day"
  xAxisLabel: string = 'Date';
  yAxisLabel: string = 'Hours';


  //endregion

  //region Initial Functions

  constructor() {}

  ngOnInit(): void
  {

  }

  //endregion

  //region Charts

  //each group is a data if the date already exists add the name and hours to it otherwise create a new date and add
  //Gets the total time for each user and sets the pie chart
  getTotalTimes(timeCards: ITimeCard[], user: IUser): void
  {
    let totalTime = 0;
    let name = user.firstName + " " + user.lastName;
    timeCards.forEach(timeCard =>
    {
      let newIn = new Date(parseInt(timeCard.timeIn as string));
      let newOut = new Date(parseInt(timeCard.timeOut as string));
      let hours = (newOut.getTime() - newIn.getTime())/ 3600000;
      let date = (newIn.getMonth() + 1) + "/" + newIn.getDate() + "/" + newIn.getFullYear();

      //Date not in list
      if(this.lineData.findIndex(value => value.name == date) == -1)
      {
        this.lineData = [...this.lineData, {name: date, series:[{name: name, value: hours}]}];
      }
      //Date in list
      else
      {
        //User doesn't have a series yet
        // @ts-ignore
        if(this.lineData.find(value => value.name == date).series.findIndex(x => x.name == name) == -1)
        {
          // @ts-ignore
          this.lineData.find(value => value.name == date).series.push({name: name, value: hours});
        }
        //User already has a series
        else
        {
          // @ts-ignore
          this.lineData.find(value => value.name == date).series.find(x => x.name == name).value += hours;
        }
      }
      totalTime += hours;
    });

    this.lineData.sort(function(a,b){
      // @ts-ignore
      return new Date(a.name).getTime() - new Date(b.name).getTime()
    });
    this.lineData = [...this.lineData];
    this.pieData = [...this.pieData, {name: name, value: totalTime}];

  }
  //endregion
}

export interface PieChartData
{
  name?: string;
  value?: number;
}
//name: Date
export interface LineChartData
{
  name?: string;
  series?: Data[];
}
//name: users name, value: hours
export interface Data
{
  name?: string;
  value?: number;
}
// export interface LineChartData
// {
//   name?: string;
//   series?: Data[];
// }
// export interface Data
// {
//   name?: Date;
//   value?: number;
// }

