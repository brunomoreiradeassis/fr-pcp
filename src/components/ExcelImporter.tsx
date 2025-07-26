
import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as XLSX from 'xlsx';

interface ImportedRow {
  [key: string]: any;
}

interface ExcelImporterProps {
  onDataImported: (data: ImportedRow[]) => void;
  expectedColumns: string[];
  turno: 1 | 2;
  className?: string;
}

const ExcelImporter: React.FC<ExcelImporterProps> = ({
  onDataImported,
  expectedColumns,
  turno,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<ImportedRow[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const processExcelFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setImportStatus('idle');
    setErrorMessage('');

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
        throw new Error('Arquivo deve conter pelo menos um cabeçalho e uma linha de dados');
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1);

      // Mapear dados para formato esperado
      const mappedData: ImportedRow[] = rows.map((row, index) => {
        const rowData: ImportedRow = {};
        headers.forEach((header, colIndex) => {
          const value = row[colIndex];
          rowData[header] = value !== undefined ? value : '';
        });
        rowData._rowIndex = index + 2; // +2 para contar cabeçalho e índice 1-based
        return rowData;
      }).filter(row => {
        // Filtrar linhas vazias
        return Object.values(row).some(value => value !== '' && value !== null && value !== undefined);
      });

      console.log('Dados importados:', mappedData);
      setPreviewData(mappedData.slice(0, 5)); // Preview das primeiras 5 linhas
      setImportStatus('success');
      
      // Aguardar um momento para mostrar preview antes de chamar callback
      setTimeout(() => {
        onDataImported(mappedData);
      }, 500);

    } catch (error) {
      console.error('Erro ao processar arquivo Excel:', error);
      setImportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido ao processar arquivo');
    } finally {
      setIsProcessing(false);
    }
  }, [onDataImported]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );

    if (excelFile) {
      processExcelFile(excelFile);
    }
  }, [processExcelFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  }, [processExcelFile]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Importar dados Apontamento {turno}° Turno
          <Badge variant={turno === 1 ? "default" : "secondary"}>
            {turno}° Turno
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className={`mx-auto h-12 w-12 mb-4 ${
            isDragging ? 'text-primary' : 'text-muted-foreground'
          }`} />
          
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isDragging ? 'Solte o arquivo aqui' : 'Arraste e solte seu arquivo Excel'}
            </p>
            <p className="text-xs text-muted-foreground">
              Ou clique no botão abaixo para selecionar
            </p>
          </div>

          <div className="mt-4">
            <Button
              variant="outline"
              disabled={isProcessing}
              onClick={() => document.getElementById(`file-input-${turno}`)?.click()}
            >
              {isProcessing ? 'Processando...' : 'Selecionar Arquivo Excel'}
            </Button>
            <input
              id={`file-input-${turno}`}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>

        {importStatus === 'success' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Arquivo importado com sucesso! {previewData.length} linhas processadas.
            </AlertDescription>
          </Alert>
        )}

        {importStatus === 'error' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro na importação: {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {previewData.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Preview dos dados (primeiras 5 linhas):</h4>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    {Object.keys(previewData[0]).filter(key => key !== '_rowIndex').map(key => (
                      <th key={key} className="px-3 py-2 text-left font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className="border-t">
                      {Object.entries(row).filter(([key]) => key !== '_rowIndex').map(([key, value]) => (
                        <td key={key} className="px-3 py-2">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelImporter;
