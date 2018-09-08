import {csv, select} from 'd3';
import AgeGender from './graphs/AgeGender';
import OriginGender from './graphs/OriginGender';
import Education from './graphs/Education';

document.addEventListener("DOMContentLoaded", function(event) {
  csv('https://cdn.glitch.com/65fc4036-c50a-4243-9aec-c7cf33c51c9c%2F2017-fCC-New-Coders-Survey-Data.csv')
  .then(function(data){
    var ageData =[];
    var countryData = {};
    var educationTmp = {};
    data.forEach(function(d){
      if (!isNaN(parseInt(d.Age)))
        ageData.push({gender:d.Gender, age:parseInt(d.Age)});
      if(!(d.CountryLive in countryData)){
        countryData[d.CountryLive] = {male:0,female:0,other:0};
        if (d.Gender=='male')
          countryData[d.CountryLive]['male']+=1;
        else if (d.Gender=='female')
          countryData[d.CountryLive]['female']+=1;
        else 
          countryData[d.CountryLive]['other']+=1;
      } else {
        if (d.Gender=='male')
          countryData[d.CountryLive]['male']+=1;
        else if (d.Gender=='female')
          countryData[d.CountryLive]['female']+=1;
        else 
          countryData[d.CountryLive]['other']+=1;
      }
      if (!(d.SchoolDegree in educationTmp)) {
        educationTmp[d.SchoolDegree] = {};
        educationTmp[d.SchoolDegree][d.SchoolMajor] = 1;
      } else {
        if (!(d.SchoolMajor in educationTmp[d.SchoolDegree])) {
          educationTmp[d.SchoolDegree][d.SchoolMajor] = 1;
        } else {
          educationTmp[d.SchoolDegree][d.SchoolMajor] +=1;
        }
      }
    });

    
    // clean data
    countryData['USA'] = countryData['United States of America'];
    delete countryData['United States of America'];
    countryData['England'] = countryData['United Kingdom'];
    delete countryData['United Kingdom'];
    countryData['South Korea'] = countryData['Korea South'];
    delete countryData['Korea South'];
    countryData['Netherlands'] = countryData['Netherlands (Holland, Europe)'];
    delete countryData['Netherlands (Holland, Europe)'];

    var educationData={degree:[],major:[]};
    for (var degree in educationTmp){
      if (degree !=="NA"){
        var degreetotal = Object.values(educationTmp[degree]).reduce(function(a,b){return a+b});
        educationData.degree.push({value:degree,count:degreetotal});
        var majortmp =[];
        for (var major in educationTmp[degree]){
            majortmp.push({value: major, count:educationTmp[degree][major],belongdegree:degree,degreetotal:degreetotal});
        }
        majortmp.sort(function(a,b){
          if(a.value=='NA'){
            return 1;
          } else {
            if (b.count>a.count){
              return 1;
            } else if (b.count<a.count){
              return -1;
            } else {
              return 0;
            }
          }
          });
        educationData.major.push.apply(educationData.major,majortmp);
      }
    }
    var scrollCount = 0;
    var scrollPages = [{func:OriginGender,data:countryData},{func:Education,data:educationData}];


    select('.loaderwrap').remove();
    AgeGender(ageData);

    while (document.body.scrollHeight<= document.body.offsetHeight) {
      scrollPages[scrollCount].func(scrollPages[scrollCount].data);
      scrollCount+=1;
      if (scrollCount>=scrollPages.length) break;
    }

    window.onscroll = function(ev) {
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight&&scrollCount<scrollPages.length) {
      scrollPages[scrollCount].func(scrollPages[scrollCount].data);
      scrollCount+=1;
    }
  };

  })
  .catch(function(err){
      console.log(err);
  });
});