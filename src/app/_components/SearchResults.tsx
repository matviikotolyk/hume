import React from "react";
import { Box, Text, Link } from "@radix-ui/themes";
import { Info } from "lucide-react";

interface SearchResult {
  title: string;
  summary: string;
  url: string;
}

interface SearchResultsProps {
  results: SearchResult[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  return (
    <Box className="rounded-md border border-gray-300 bg-[#f09c92] p-4 text-white">
      <div className="flex flex-row items-center gap-2">
        <Text weight="medium" size="3" className="mb-2">
          Search Results
        </Text>
        <Info className="mb-2 text-white" />
      </div>
      {results.map((result, index) => (
        <div className="mb-4 flex flex-col gap-2" key={index}>
          <Text weight="bold">{result.title}</Text>
          <div className="flex flex-col">
            <Text>{result.summary}</Text>
            <Link
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:underline"
            >
              Read more
            </Link>
          </div>
        </div>
      ))}
    </Box>
  );
};

export default SearchResults;
