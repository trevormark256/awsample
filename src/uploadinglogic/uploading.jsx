import React, { useState } from 'react';
import { Storage } from 'aws-amplify';
import { Spinner } from 'react-bootstrap';

function Uploading() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [warning, setWarning] = useState('');
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
      alert('Invalid file type. Only images, videos, audio, and PDFs are allowed.');
    }
  };

  const handleMetadataChange = (event) => {
    const { name, value } = event.target;
    setMetadata({ ...metadata, [name]: value });
  };

  const validateFields = () => {
    if (!file || !metadata.title || !metadata.description || !metadata.author) {
      setWarning('Please fill in all fields before uploading.');
      return false;
    }
    setWarning('');
    return true;
  };

  const uploadFile = async () => {
    if (!validateFields()) return;
    setUploading(true);

    const folder = file.type.startsWith('image') ? 'images/' : 'videos/';
    const timestamp = new Date().toISOString(); // Get current timestamp
    const fileKey = `${folder}${file.name}`;

    try {
      await Storage.put(fileKey, file, {
        contentType: file.type,
        metadata: {
          title: metadata.title,
          description: metadata.description,
          author: metadata.author,
          timestamp: timestamp, // Include timestamp in metadata
        },
      });

      setUploading(false);
      setSuccessMessage('File uploaded successfully.');
      // Clear the fields after successful upload
      setFile(null);
      setMetadata({ title: '', description: '', author: '' });
    } catch (error) {
      console.error(error);
      setUploading(false);
      setErrorMessage('Error uploading file: ' + error.message);
    }
  };

  return (
    <div className="container mt-4">
      {warning && (
        <div className="alert alert-warning mt-2" role="alert">
          {warning}
        </div>
      )}
      <input type="file" className="form-control" required onChange={handleFileChange} />
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
          <Spinner animation="border" className="bg-green" size="sm" role="status" />
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
  );
}

export default Uploading;
