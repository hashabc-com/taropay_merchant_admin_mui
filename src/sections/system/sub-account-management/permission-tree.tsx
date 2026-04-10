import type { PermissionNode } from './hooks';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  tree: PermissionNode[];
  value: string[];
  onChange: (next: string[]) => void;
};

function collectKeys(node: PermissionNode): string[] {
  const keys = [node.key];
  if (node.children) {
    node.children.forEach((c: PermissionNode) => keys.push(...collectKeys(c)));
  }
  return keys;
}

// ----------------------------------------------------------------------

export function PermissionTree({ tree, value, onChange }: Props) {
  const { t } = useLanguage();
  const selected = useMemo(() => new Set(value), [value]);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    tree.forEach((n) => s.add(n.key));
    return s;
  });

  const toggle = useCallback(
    (keys: string[], checked: boolean) => {
      const next = new Set(selected);
      if (checked) {
        keys.forEach((k) => next.add(k));
      } else {
        keys.forEach((k) => next.delete(k));
      }
      onChange(Array.from(next));
    },
    [selected, onChange]
  );

  const allTreeKeys = useMemo(() => {
    const keys: string[] = [];
    tree.forEach((n) => keys.push(...collectKeys(n)));
    return keys;
  }, [tree]);

  const isAllChecked = allTreeKeys.length > 0 && allTreeKeys.every((k) => selected.has(k));
  const isAllIndeterminate =
    !isAllChecked && allTreeKeys.length > 0 && allTreeKeys.some((k) => selected.has(k));

  const renderNode = (node: PermissionNode) => {
    const allKeys = collectKeys(node);
    const isChecked = allKeys.every((k) => selected.has(k));
    const isIndeterminate = !isChecked && allKeys.some((k) => selected.has(k));
    const hasChildren = !!node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.key);

    const toggleExpand = () => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(node.key)) {
          next.delete(node.key);
        } else {
          next.add(node.key);
        }
        return next;
      });
    };

    return (
      <Box key={node.key}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {hasChildren ? (
            <Box sx={{ width: 28, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <IconButton size="small" onClick={toggleExpand} sx={{ p: 0 }}>
                <Iconify icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'} width={18} />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ width: 28, flexShrink: 0 }} />
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked}
                indeterminate={isIndeterminate}
                onChange={(_, checked) => toggle(allKeys, checked)}
                size="small"
              />
            }
            label={<Typography variant="body2">{node.label}</Typography>}
          />
        </Box>
        {hasChildren && (
          <Collapse in={isExpanded}>
            <Box sx={{ pl: 4 }}>
              {node.children?.map((child: PermissionNode) => renderNode(child))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: 28, flexShrink: 0 }} />
        <FormControlLabel
          control={
            <Checkbox
              checked={isAllChecked}
              indeterminate={isAllIndeterminate}
              onChange={(_, checked) => toggle(allTreeKeys, checked)}
              size="small"
            />
          }
          label={<Typography variant="body2">{t('common.selectAll')}</Typography>}
        />
      </Box>
      {tree.map((n) => renderNode(n))}
    </Box>
  );
}
