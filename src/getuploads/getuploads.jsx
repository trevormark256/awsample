import React, { useState, useEffect } from 'react';
import { Storage } from 'aws-amplify';
import { Table, Button, Spinner } from 'react-bootstrap';

function GetUploads() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const fileKeys = await Storage.list('');
        setFiles(fileKeys);
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

  const downloadSelectedFiles = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedFiles.map(async (fileKey) => {
        const url = await Storage.get(fileKey);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileKey);
        document.body.appendChild(link);
        link.click();
      }));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error downloading file: ", error);
      setErrorMessage("Error downloading file: " + error.message);
    }
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
            <span className="sr-only">Loading...</span>
          </Spinner>
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
              <tr key={file.key}>
                <td>{index + 1}</td>
                <td>{file.key}</td>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={file.key}
                    onChange={(event) => handleFileSelect(event, file.key)}
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
