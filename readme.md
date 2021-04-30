# oxygen-export

This contains a small script that you can use to export patient files from CGM Oxygen.

## How to

- Run `npm ci`
- Create an `input` folder and add the xml files from Oxygen (see below how to obtain them)
- Create an `output` folder
- Run `node index.js`

The script will load the XMl files in memory (as JSON). Even though the files can be quite 
large, I didn't expierence any problems and things were fast for >200 patients.

The data will be transformed using the `template.mustache` file and the result is a HTML
file that you can then save as PDF.

## Getting the XML files from Oxygen

In CGM Oxygen, go to Rapporten > Lijsten > Administratief > Patiëntendossiers. Right-click
in the list, choose "Exporteer Dossiers" and click "Exporteren."
