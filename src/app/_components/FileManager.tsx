import React from "react";
import { Box, Text, Button, ScrollArea } from "@radix-ui/themes";
import type { UploadedFile } from "./LandingPage";

interface FileManagerProps {
  uploadedFiles: UploadedFile[];
  selectedFile: UploadedFile | null;
  setSelectedFile: (file: UploadedFile | null) => void;
}

const FileManager: React.FC<FileManagerProps> = ({
  uploadedFiles,
  selectedFile,
  setSelectedFile,
}) => {
  return (
    <Box className="mt-4 rounded-md border border-gray-300 bg-[#F5F5F5] p-4">
      <Text weight="medium" size="3" style={{ marginBottom: "1rem" }}>
        Uploaded Files
      </Text>
      <ScrollArea style={{ height: "auto" }}>
        {uploadedFiles.map((file, index) => (
          <Box key={index} style={{ marginBottom: "1rem" }}>
            <Button
              color="blue"
              onClick={() => setSelectedFile(file)}
              variant={selectedFile?.name === file.name ? "solid" : "outline"}
              className="w-full justify-start"
            >
              {file.name}
            </Button>
          </Box>
        ))}
      </ScrollArea>
      {selectedFile && (
        <Box className="mt-4">
          <Text weight="medium" size="2">
            Analysis: <br></br>
          </Text>
          <Text size="1" weight={"light"}>
            {selectedFile.analysis}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default FileManager;
