import React, { useState } from 'react';
import AWS from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';
import { Spinner } from 'react-bootstrap';

function Uploading() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const[warning ,setwarning]=useState("")
  const [errorMessage, setErrorMessage] = useState('');
  const [metadata, setMetadata] = useState({ title: '', description: '', author: '' });

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    // Add more supported types as needed
  ];

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      alert('Invalid file type. Only images and videos are allowed.');
    }
  };

  const handleMetadataChange = (event) => {
    const { name, value } = event.target;
    setMetadata({ ...metadata, [name]: value });
  };

  const validateFields = () => {
    if (!file || !metadata.title || !metadata.description || !metadata.author) {
        setwarning("Please fill in all fields before uploading.")
    
      return false;
    }
    return true;
  };
  const uploadFile = async () => {
    if (!validateFields()) return;
    setUploading(true);
   
const S3_BUCKET = process.env.REACT_APP_S3_BUCKET;
const REGION = process.env.REACT_APP_REGION;
  
    AWS.config.update({
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        });
  
    const s3 = new S3({
      params: { Bucket: S3_BUCKET },
      region: REGION,
    });
    
console.log('Bucket:', S3_BUCKET);
console.log('Region:', REGION);
console.log('Access Key ID:', process.env.REACT_APP_AWS_ACCESS_KEY_ID);
console.log('Secret Access Key:', process.env.REACT_APP_AWS_SECRET_ACCESS_KEY);
  
    const folder = file.type.startsWith('image') ? 'images/' : 'videos/';
    const timestamp = new Date().toISOString(); // Get current timestamp
    const params = {
      Bucket: S3_BUCKET,
      Key: folder + file.name,
      Body: file,
      Metadata: {
        title: metadata.title,
        description: metadata.description,
        author: metadata.author,
        timestamp: timestamp, // Include timestamp in metadata
      },
    };
  
    try {
      const upload = await s3.putObject(params).promise();
      console.log(upload);
      setUploading(false);
      setSuccessMessage("File uploaded successfully.");
      // Clear the fields after successful upload
      setFile(null);
      setMetadata({ title: '', description: '', author: '' });
    } catch (error) {
      console.error(error);
      setUploading(false);
      setErrorMessage("Error uploading file: " + error.message);
    }
  };
  

  return (
    <>
      <div className="container mt-4">
      {warning && (
          <div className="alert alert-warning mt-2" role="alert">
            {warning}
          </div>
        )}
     
        <input type="file" className='form-control' required onChange={handleFileChange} />
        <div className="form-group mt-2">
          <input type="text" required className="form-control" name="title" value={metadata.title} onChange={handleMetadataChange} placeholder="Title" />
        </div>
        <div className="form-group mt-2">
          <textarea className="form-control" name="description" value={metadata.description} onChange={handleMetadataChange} placeholder="Description" rows="3"></textarea>
        </div>
        <div className="form-group mt-2">
          <input type="text" required className="form-control" name="author" value={metadata.author} onChange={handleMetadataChange} placeholder="Author" />
        </div>
        <button className="btn btn-primary mt-2" onClick={uploadFile} disabled={uploading}>
          {uploading ? (
            <Spinner animation="border" size="sm" role="status">
           
            </Spinner>
            
          ) : (
            'Upload File'
          )}
        </button>
        {successMessage && (
          <div className="alert alert-success mt-2" role="alert">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="alert alert-danger mt-2" role="alert">
            {errorMessage}
          </div>
        )}
      </div>
    </>
  );
}

export default Uploading;
