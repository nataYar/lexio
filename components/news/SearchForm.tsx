import React from "react";
import Select from "react-select";
import { Form, Button } from "react-bootstrap";
import { countryOptions, categoryOptions } from "../../utils/search-options";

type Props = {
  selectedCountries: string[];
  selectedCategories: string[];
  keyword: string;
  searchInTitleOnly: boolean;
  setSelectedCountries: (v: string[]) => void;
  setSelectedCategories: (v: string[]) => void;
  setKeyword: (v: string) => void;
  setSearchInTitleOnly: (v: boolean) => void;
  onSubmit:  (e: React.FormEvent) => void;
};

export default function SearchForm({
  selectedCountries,
  selectedCategories,
  keyword,
  searchInTitleOnly,
  setSelectedCountries,
  setSelectedCategories,
  setKeyword,
  setSearchInTitleOnly,
  onSubmit,
}: Props) {
  return (
    <Form
    className="mx-auto w-full md:w-2/3"
      onSubmit={(e) => {
        e.preventDefault();   // optional here if parent handles it
        onSubmit(e);
      }}
    >
      <Form.Group controlId="countries">
        <Form.Label>Countries (max 5)</Form.Label>
        <Select
          isMulti
          options={countryOptions}
          value={countryOptions.filter((o) => selectedCountries.includes(o.value))}
          onChange={(selected) =>
            setSelectedCountries(selected.map((o) => o.value).slice(0, 5))
          }
          placeholder="Select countries..."
        />
      </Form.Group>

      <Form.Group className="my-3" controlId="categories">
        <Form.Label>Categories (max 5)</Form.Label>
        <Select
          isMulti
          options={categoryOptions}
          value={categoryOptions.filter((o) => selectedCategories.includes(o.value))}
          onChange={(selected) =>
            setSelectedCategories(selected.map((o) => o.value).slice(0, 5))
          }
          placeholder="Select categories..."
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Keyword (optional)</Form.Label>
        <Form.Control
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g. AI, climate"
        />
      </Form.Group>

      <Form.Group className="mb-3 text-muted">
        <Form.Check
          type="switch"
          id="searchInTitleSwitch"
          label="Search in title only"
          checked={searchInTitleOnly}
          onChange={(e) => setSearchInTitleOnly(e.target.checked)}
        />
      </Form.Group>

      <Button type="submit">Search</Button>
    </Form>
  );
}