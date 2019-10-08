#!/usr/bin/env node

const fetch = require("node-fetch");
const inquirer = require("inquirer");
const fs = require("fs");

(async function main() {
  try {
    inquirer
      .prompt([
        {
          name: "destination",
          type: "input",
          message: "Enter the directory where you would like to download the george files",
          default: "./",
        },
        {
          name: "assignmentNumber",
          type: "input",
          message: "Which assignment would you like to download?",
          validate: (value) => {
            var valid = !isNaN(parseFloat(value));
            return valid || 'Please enter a number';
          },
          filter: Number,
        },
        {
          name: "groupMembers",
          type: "input",
          message: "Enter comma-separated WatIAM user IDs of your group members"
        }   
      ])
      .then(async answers => {
        let { assignmentNumber, destination, groupMembers } = answers;

        groupMembers = groupMembers.split(",");

        if (groupMembers.length > 2 || groupMembers.length == 0) {
          throw new Error("Invalid WatIAM user IDs entered");
        } 

        let questionNumber = 1;

        let assignmentUrl = `https://www.student.cs.uwaterloo.ca/~se212/asn/a0${assignmentNumber}grg/a0${assignmentNumber}q`;
        while (questionNumber < 10) {
          let questionUrl = `${assignmentUrl}0${questionNumber}.grg`;
          let res = await getFile(questionUrl);
          if (res.status > 400) {
            console.log("No more questions");
            return;
          }
          let fileName = `${destination}/a0${assignmentNumber}q0${questionNumber}.grg`;
          console.log(`Saving ${fileName}`);

          let text = await res.text; 
          text = text.slice(3, text.length);
          if (groupMembers.length == 2) {
            text = `#u ${groupMembers[0].trim()} ${groupMembers[1].trim()}\n${text}`; 
          } else {
            text = `#u ${groupMembers[0].trim()}\n${text}`; 
          }
          
          saveToFile(fileName, await text);
          questionNumber++;
        }
      });
  } catch (err) {
    console.log(err);
  } 
})();

function getFile(url) {
  return fetch(url).then(res =>  { 
    return {
      text: res.text(),
      status: res.status,
    }
  }).catch(err => console.log(err));
}


function saveToFile(fileName, fileContent) {
  fs.writeFile(fileName, fileContent, (err) => {
    if (err) throw err;
    console.log("Saved!");
  });
}