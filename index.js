const parser = require('xml2json');
const fs = require('fs');
const util = require('util');
const mustache = require('mustache');
const wax = require('@jvitela/mustache-wax');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

wax(mustache);

mustache.Formatters = {
    date: function(dt) {
        if (!dt) {
            return undefined;
        }

        var d = new Date(dt);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
};

async function main() {
    const patientXmlBuffer = await readFile('./input/Patient.xml');
    const patientXml = patientXmlBuffer.toString('utf-8');
    const patientJson = parser.toJson(patientXml);
    const patientsData = JSON.parse(patientJson).Patient;
    const patients = patientsData.Patient;
    const patientAddresses = patientsData.PatientAddresses;
    const patientTels = patientsData.PatientTels;
    const patientNets = patientsData.PatientNets;
    const patientGCs = patientsData.PatientGCs;

    const prescriptionXmlBuffer = await readFile('./input/Prescription.xml');
    const prescriptionXml = prescriptionXmlBuffer.toString('utf-8');
    const prescriptionJson = parser.toJson(prescriptionXml);
    const prescriptionsData = JSON.parse(prescriptionJson).Prescription;
    const prescriptions = prescriptionsData.Prescription; 

    const periodXmlBuffer = await readFile('./input/Period.xml');
    const periodXml = periodXmlBuffer.toString('utf-8');
    const periodJson = parser.toJson(periodXml);
    const periodsData = JSON.parse(periodJson).Period;
    const periods = periodsData.Period; 

    const patientsDenormalized = [];
    
    patients.forEach(p => {
        const patientDenormalized = {...p};
        
        patientDenormalized.Addresses = getFromCollection(patientAddresses, 'ContactID', patientDenormalized.PatientID, 'Address');
        patientDenormalized.Telephones = getFromCollection(patientTels, 'ContactID', patientDenormalized.PatientID, 'Telephone');
        patientDenormalized.Emails = getFromCollection(patientNets, 'ContactID', patientDenormalized.PatientID, 'Email');
        patientDenormalized.GCs = getFromCollection(patientGCs, 'PatientID', patientDenormalized.PatientID, 'GCs');
        patientDenormalized.Prescriptions = getFromCollection(prescriptions, 'PatientID', patientDenormalized.PatientID, 'Prescriptions');
        patientDenormalized.Periods = getFromCollection(periods, 'PatientID', patientDenormalized.PatientID, 'Periods');

        patientsDenormalized.push(patientDenormalized);
    });


    const templateBuffer = await readFile('./template.mustache');
    const template = templateBuffer.toString('utf-8');
    var output = mustache.render(template, {patients: patientsDenormalized, count: patientsDenormalized.length});
    await writeFile('./output/result.html', output);
}

function getFromCollection(collection, patientIdentifier, patientId, fieldName) {
    const items = collection.filter(a => a[patientIdentifier] === patientId);
    return items;
}

return main()
    .then(() => {
        console.info('Done');
    })
    .catch(e => {
        console.error(e);
    });
