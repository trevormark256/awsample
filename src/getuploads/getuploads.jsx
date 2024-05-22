import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';
import { Table, Button } from 'react-bootstrap';
import { Spinner } from 'react-bootstrap';

const S3_BUCKET = process.env.REACT_APP_S3_BUCKET;
const REGION = process.env.REACT_APP_REGION;

AWS.config.update({
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,

});

const s3 = new S3({
  region: REGION,
});

function GetUploads() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
const[loading , setloading]=useState(false)


  const fetchFiles = async () => {
     console.log('Bucket:', S3_BUCKET);
  console.log('Region:', REGION);
  console.log('Access Key ID:', process.env.REACT_APP_ACCESS_KEY_ID);
  console.log('Secret Access Key:', process.env.REACT_APP_SECRET_ACCESS_KEY);
    
    const params = {
      Bucket: S3_BUCKET,
    };

    try {
      setloading(true)
      const data = await s3.listObjectsV2(params).promise();
      setFiles(data.Contents);
      setloading(false)
    } catch (error) {
      setloading(false)
      console.error("Error fetching files: ", error);
      setErrorMessage("Error fetching files: " + error.message);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileSelect = (event, fileKey) => {
    if (event.target.checked) {
      setSelectedFiles([...selectedFiles, fileKey]);
    } else {
      setSelectedFiles(selectedFiles.filter(key => key !== fileKey));
    }
  };

  const downloadSelectedFiles = () => {
    selectedFiles.forEach(async (fileKey) => {
      const params = {
        Bucket: S3_BUCKET,
        Key: fileKey,
      };

      try {
        const data = await s3.getObject(params).promise();
        const url = window.URL.createObjectURL(new Blob([data.Body]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileKey);
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error("Error downloading file: ", error);
        setErrorMessage("Error downloading file: " + error.message);
      }
    });
  };

  return (
    <div className="container mt-4">
      <h3>Files in S3 Bucket</h3>
      {errorMessage && (
        <div className="alert alert-danger mt-2" role="alert">
          {errorMessage}
        </div>
      )}
        {loading ? 
          <><Spinner className='col-12' animation="border" size="sm" role="status">

        </Spinner>
        <br /></>

            :
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>File Name</th>
            <th>Select</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <tr key={file.Key}>
              <td>{index + 1}</td>
              <td>{file.Key}</td>
              <td>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={file.Key}
                  onChange={(event) => handleFileSelect(event, file.Key)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      }
      <button className="btn btn-secondary mt-2" onClick={downloadSelectedFiles} disabled={selectedFiles.length === 0}>
        Download Selected Files
      </button>
    </div>
  );
}

export default GetUploads;
