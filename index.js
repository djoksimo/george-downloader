#!/usr/bin/env node

const fetch = require("node-fetch");
const inquirer = require("inquirer");
const fs = require("fs");
const prompts = require("./prompts.json");

(async function main() {
  try {
    const { assignmentNumber, destination, groupMembers } = await inquirer.prompt([
      prompts["destination"],
      { ...prompts["assignmentNumber"], 
        validate: (value) => {
          var valid = !isNaN(parseFloat(value));
          return valid || 'Please enter a number';
        },
        filter: Number,
      },
      prompts["groupMembers"]
    ]);

    const members = groupMembers.split(",");
    console.log(members);

    if (members.length > 2 || members.length == 0) {
      throw new Error("Invalid WatIAM user IDs entered");
    } 

    let questionNumber = 1;

    const assignmentUrl = `https://www.student.cs.uwaterloo.ca/~se212/asn/a0${assignmentNumber}grg/a0${assignmentNumber}q`;
    while (questionNumber < 10) {
      let questionUrl = `${assignmentUrl}0${questionNumber}.grg`;
      let res = await getFile(questionUrl);
      if (res.status > 400) {
        console.log("No more questions");
        return;
      }
      let fileName = `${destination}/a0${assignmentNumber}q0${questionNumber}.grg`;
      console.log(`Saving ${fileName}`);

      text = res.text.slice(3, res.text.length);
      if (members.length == 2) {
        text = `#u ${members[0].trim()} ${members[1].trim()}\n${text}`; 
      } else {
        text = `#u ${members[0].trim()}\n${text}`; 
      }
      
      saveToFile(fileName, await text);
      questionNumber++;
    }
  } catch (err) {
    console.log(err);
  } 
})();

function getFile(url) {
  return fetch(url).then(async res =>  { 
    return {
      text: await res.text(),
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