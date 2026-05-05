import Asset from '../models/Asset.js';
import XLSX from 'xlsx';

// @desc    Listar todos os ativos
// @route   GET /api/assets
// @access  Private
export const getAssets = async (req, res, next) => {
    try {
        const { status, assignedTo } = req.query;

        let query = {};
        if (status) query.status = status;
        if (assignedTo) query.assignedTo = assignedTo;

        const assets = await Asset.find(query)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: assets.length,
            data: assets
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obter ativo por ID
// @route   GET /api/assets/:id
// @access  Private
export const getAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id)
            .populate('assignedTo', 'name email');

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Ativo não encontrado'
            });
        }

        res.json({
            success: true,
            data: asset
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Criar novo ativo
// @route   POST /api/assets
// @access  Private (Admin/Tecnico)
export const createAsset = async (req, res, next) => {
    try {
        const asset = await Asset.create(req.body);

        const populatedAsset = await Asset.findById(asset._id)
            .populate('assignedTo', 'name email');

        res.status(201).json({
            success: true,
            data: populatedAsset
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Atualizar ativo
// @route   PUT /api/assets/:id
// @access  Private (Admin/Tecnico)
export const updateAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name email');

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Ativo não encontrado'
            });
        }

        res.json({
            success: true,
            data: asset
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Deletar ativo
// @route   DELETE /api/assets/:id
// @access  Private (Admin)
export const deleteAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Ativo não encontrado'
            });
        }

        await asset.deleteOne();

        res.json({
            success: true,
            message: 'Ativo deletado com sucesso'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Exportar ativos para Excel
// @route   GET /api/assets/export/excel
// @access  Private (Admin/Tecnico)
export const exportAssets = async (req, res, next) => {
    try {
        const assets = await Asset.find()
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        // Formatar dados para Excel
        const data = assets.map(asset => ({
            'ID do Ativo': asset.assetId,
            'Descrição': asset.description,
            'Tipo': asset.type,
            'Marca': asset.brand || '',
            'Modelo': asset.model || '',
            'Número de Série': asset.serialNumber || '',
            'Data de Compra': asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('pt-BR') : '',
            'Garantia Até': asset.warrantyExpiration ? new Date(asset.warrantyExpiration).toLocaleDateString('pt-BR') : '',
            'Status': asset.status,
            'Localização': asset.location || '',
            'Responsável': asset.assignedTo?.name || '',
            'Email do Responsável': asset.assignedTo?.email || ''
        }));

        // Criar workbook e worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Ajustar largura das colunas
        const colWidths = [
            { wch: 15 }, // ID do Ativo
            { wch: 40 }, // Descrição
            { wch: 15 }, // Tipo
            { wch: 15 }, // Marca
            { wch: 20 }, // Modelo
            { wch: 20 }, // Número de Série
            { wch: 15 }, // Data de Compra
            { wch: 15 }, // Garantia Até
            { wch: 15 }, // Status
            { wch: 30 }, // Localização
            { wch: 25 }, // Responsável
            { wch: 30 }  // Email do Responsável
        ];
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, 'Ativos');

        // Gerar buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Enviar arquivo
        res.setHeader('Content-Disposition', 'attachment; filename=ativos.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        next(error);
    }
};

// @desc    Importar ativos de Excel
// @route   POST /api/assets/import/excel
// @access  Private (Admin/Tecnico)
export const importAssets = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo foi enviado'
            });
        }

        // Ler arquivo Excel
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'O arquivo está vazio'
            });
        }

        const results = {
            success: [],
            errors: []
        };

        // Processar cada linha
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // Mapear campos do Excel para o modelo
                const assetData = {
                    assetId: row['ID do Ativo'] || row['assetId'],
                    description: row['Descrição'] || row['description'],
                    type: row['Tipo'] || row['type'] || 'outro',
                    brand: row['Marca'] || row['brand'] || '',
                    model: row['Modelo'] || row['model'] || '',
                    serialNumber: row['Número de Série'] || row['serialNumber'] || '',
                    status: row['Status'] || row['status'] || 'disponivel',
                    location: row['Localização'] || row['location'] || ''
                };

                // Converter datas se existirem
                if (row['Data de Compra'] || row['purchaseDate']) {
                    const dateStr = row['Data de Compra'] || row['purchaseDate'];
                    assetData.purchaseDate = parseExcelDate(dateStr);
                }

                if (row['Garantia Até'] || row['warrantyExpiration']) {
                    const dateStr = row['Garantia Até'] || row['warrantyExpiration'];
                    assetData.warrantyExpiration = parseExcelDate(dateStr);
                }

                // Verificar se o ativo já existe
                const existingAsset = await Asset.findOne({ assetId: assetData.assetId });

                if (existingAsset) {
                    // Atualizar ativo existente
                    await Asset.findByIdAndUpdate(existingAsset._id, assetData, { runValidators: true });
                    results.success.push({ row: i + 2, assetId: assetData.assetId, action: 'atualizado' });
                } else {
                    // Criar novo ativo
                    await Asset.create(assetData);
                    results.success.push({ row: i + 2, assetId: assetData.assetId, action: 'criado' });
                }
            } catch (error) {
                results.errors.push({
                    row: i + 2,
                    assetId: row['ID do Ativo'] || row['assetId'] || 'N/A',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Importação concluída: ${results.success.length} ativos processados, ${results.errors.length} erros`,
            data: results
        });
    } catch (error) {
        next(error);
    }
};

// Função auxiliar para converter datas do Excel
function parseExcelDate(dateStr) {
    if (!dateStr) return null;

    // Se for número (data do Excel)
    if (typeof dateStr === 'number') {
        const date = XLSX.SSF.parse_date_code(dateStr);
        return new Date(date.y, date.m - 1, date.d);
    }

    // Se for string no formato DD/MM/YYYY
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
    }

    // Tentar converter diretamente
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
}

