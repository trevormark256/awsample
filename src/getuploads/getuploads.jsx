import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import { Table, Button, Spinner } from 'react-bootstrap';

const S3_BUCKET = process.env.REACT_APP_S3_BUCKET;
const REGION = process.env.REACT_APP_REGION;

AWS.config.update({
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
  region: REGION,
});

const s3 = new AWS.S3();

function GetUploads() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      const params = {
        Bucket: S3_BUCKET,
      };

      try {
        setLoading(true);
        const data = await s3.listObjectsV2(params).promise();
        setFiles(data.Contents);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching files: ", error);
        setErrorMessage("Error fetching files: " + error.message);
      }
    };

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
      {loading ? (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" role="status">
           
          </Spinner>
          <br/>
           <span className="sr-only">Loading...</span>
        </div>
      ) : (
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
      )}
      <Button className="mt-2" onClick={downloadSelectedFiles} disabled={selectedFiles.length === 0}>
        Download Selected Files
      </Button>
    </div>
  );
}

export default GetUploads;
