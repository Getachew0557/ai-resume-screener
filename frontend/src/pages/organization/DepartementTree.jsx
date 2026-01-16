import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view";
import { organizationAPI } from '../../services/api';

export default function DepartementTree({ onNodeSelect }) {
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await organizationAPI.getDepartments();
            const data = response.data || [];

            // We create a virtual "Root" node so the user can move items to the top level
            const rootNode = {
                id: 'root',
                label: '🏢 Company Root (Top Level)',
                children: buildTree(data)
            };

            setTreeData([rootNode]);
        } catch (err) {
            setError("Could not load departments tree.");
        } finally {
            setLoading(false);
        }
    };

    const buildTree = (departments) => {
        const departmentMap = {};
        const tree = [];

        // First pass: Map items
        departments.forEach((dept) => {
            departmentMap[dept.id] = {
                id: dept.id.toString(),
                label: dept.departmentName,
                children: [],
            };
        });

        // Second pass: Link parents/children
        departments.forEach((dept) => {
            if (dept.parentDepartmentId && departmentMap[dept.parentDepartmentId]) {
                departmentMap[dept.parentDepartmentId].children.push(departmentMap[dept.id]);
            } else {
                tree.push(departmentMap[dept.id]);
            }
        });
        return tree;
    };

    const handleSelectedItemsChange = (event, itemId) => {
        if (!itemId) return;

        if (itemId === 'root') {
            onNodeSelect(null, 'Root (Top Level)');
            return;
        }

        const findNode = (nodes, id) => {
            for (const node of nodes) {
                if (node.id === id) return node;
                if (node.children) {
                    const found = findNode(node.children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const selectedNode = findNode(treeData, itemId);
        if (onNodeSelect && selectedNode) {
            onNodeSelect(Number(selectedNode.id), selectedNode.label);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box>;

    return (
        <Box sx={{ minHeight: 300, p: 1 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                Select a department to set it as the new parent:
            </Typography>
            <RichTreeView
                items={treeData}
                onSelectedItemsChange={handleSelectedItemsChange}
            />
        </Box>
    );
}