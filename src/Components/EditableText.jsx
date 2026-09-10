import React from 'react';
import PropTypes from 'prop-types';
import { useContent } from '../Context/ContentContext';

/**
 * Reads a site_content value by key with a fallback, rendered as plain text.
 * This is the single way every public page pulls editable copy, so nothing
 * is ever hardcoded outside of a sensible default.
 */
const EditableText = ({ contentKey, fallback = '', as: Tag = 'span', className = '' }) => {
  const { text } = useContent();
  return <Tag className={className}>{text(contentKey, fallback)}</Tag>;
};

EditableText.propTypes = {
  contentKey: PropTypes.string.isRequired,
  fallback: PropTypes.string,
  as: PropTypes.elementType,
  className: PropTypes.string,
};

export default EditableText;
