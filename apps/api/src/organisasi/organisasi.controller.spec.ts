import { Test } from '@nestjs/testing';
import { OrganisasiController } from './organisasi.controller.js';
import { OrganisasiService } from './organisasi.service.js';

describe('OrganisasiController', () => {
  let controller: OrganisasiController;
  let organisasiService: jest.Mocked<OrganisasiService>;

  beforeEach(async () => {
    organisasiService = {
      createNasional: jest.fn(),
      findAllNasional: jest.fn(),
      findNasionalById: jest.fn(),
      updateNasional: jest.fn(),
      deleteNasional: jest.fn(),
      createDistrik: jest.fn(),
      findAllDistrik: jest.fn(),
      findDistrikById: jest.fn(),
      updateDistrik: jest.fn(),
      deleteDistrik: jest.fn(),
      createWilayah: jest.fn(),
      findAllWilayah: jest.fn(),
      findWilayahById: jest.fn(),
      updateWilayah: jest.fn(),
      deleteWilayah: jest.fn(),
      createRanting: jest.fn(),
      findAllRanting: jest.fn(),
      findRantingById: jest.fn(),
      updateRanting: jest.fn(),
      deleteRanting: jest.fn(),
      createUnitLatihan: jest.fn(),
      findAllUnitLatihan: jest.fn(),
      getHierarchyTree: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [OrganisasiController],
      providers: [
        { provide: OrganisasiService, useValue: organisasiService },
      ],
    }).compile();

    controller = module.get(OrganisasiController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNasional', () => {
    it('should call organisasiService.createNasional with data', async () => {
      const data = { nama: 'Nasional THS', kode: 'THS' };
      organisasiService.createNasional.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.createNasional(data);

      expect(organisasiService.createNasional).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  describe('findAllNasional', () => {
    it('should call organisasiService.findAllNasional', async () => {
      organisasiService.findAllNasional.mockResolvedValue([{ id: 1, nama: 'Nasional' }] as any);
      const result = await controller.findAllNasional();
      expect(organisasiService.findAllNasional).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findNasionalById', () => {
    it('should call organisasiService.findNasionalById with converted id', async () => {
      organisasiService.findNasionalById.mockResolvedValue({ id: 1, nama: 'Nasional THS' } as any);

      const result = await controller.findNasionalById('1');

      expect(organisasiService.findNasionalById).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, nama: 'Nasional THS' });
    });
  });

  describe('updateNasional', () => {
    it('should call organisasiService.updateNasional with converted id and data', async () => {
      const data = { nama: 'Nasional THS Update' };
      organisasiService.updateNasional.mockResolvedValue({ id: 1, ...data } as any);

      const result = await controller.updateNasional('1', data);

      expect(organisasiService.updateNasional).toHaveBeenCalledWith(1, data);
      expect(result).toEqual({ id: 1, ...data });
    });
  });

  describe('deleteNasional', () => {
    it('should call organisasiService.deleteNasional with converted id', async () => {
      organisasiService.deleteNasional.mockResolvedValue({ id: 1 } as any);

      const result = await controller.deleteNasional('1');

      expect(organisasiService.deleteNasional).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });

  // ─── Distrik ───

  describe('createDistrik', () => {
    it('should call organisasiService.createDistrik with data', async () => {
      const data = { nasionalId: 1, kodeDistrik: 'DA', nama: 'Distrik A' };
      organisasiService.createDistrik.mockResolvedValue({ id: 2, ...data } as any);

      const result = await controller.createDistrik(data);

      expect(organisasiService.createDistrik).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 2, ...data });
    });
  });

  describe('findAllDistrik', () => {
    it('should call findAllDistrik without filter', async () => {
      organisasiService.findAllDistrik.mockResolvedValue([]);
      await controller.findAllDistrik(undefined);
      expect(organisasiService.findAllDistrik).toHaveBeenCalledWith(undefined);
    });

    it('should convert nasionalId query parameter', async () => {
      organisasiService.findAllDistrik.mockResolvedValue([]);
      await controller.findAllDistrik('1');
      expect(organisasiService.findAllDistrik).toHaveBeenCalledWith(1);
    });
  });

  describe('findDistrikById', () => {
    it('should call findDistrikById with converted id', async () => {
      organisasiService.findDistrikById.mockResolvedValue({ id: 2, nama: 'Distrik A' } as any);
      const result = await controller.findDistrikById('2');
      expect(organisasiService.findDistrikById).toHaveBeenCalledWith(2);
      expect(result).toEqual({ id: 2, nama: 'Distrik A' });
    });
  });

  describe('updateDistrik', () => {
    it('should call updateDistrik with converted id', async () => {
      const data = { nama: 'Updated' };
      organisasiService.updateDistrik.mockResolvedValue({ id: 2, ...data } as any);
      const result = await controller.updateDistrik('2', data);
      expect(organisasiService.updateDistrik).toHaveBeenCalledWith(2, data);
      expect(result).toEqual({ id: 2, nama: 'Updated' });
    });
  });

  describe('deleteDistrik', () => {
    it('should call deleteDistrik with converted id', async () => {
      organisasiService.deleteDistrik.mockResolvedValue({ id: 2 } as any);
      const result = await controller.deleteDistrik('2');
      expect(organisasiService.deleteDistrik).toHaveBeenCalledWith(2);
      expect(result).toEqual({ id: 2 });
    });
  });

  // ─── Wilayah ───

  describe('createWilayah', () => {
    it('should call createWilayah with data', async () => {
      const data = { distrikId: 2, kodeWilayah: 'WA', nama: 'Wilayah A' };
      organisasiService.createWilayah.mockResolvedValue({ id: 3, ...data } as any);
      const result = await controller.createWilayah(data);
      expect(organisasiService.createWilayah).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 3, ...data });
    });
  });

  describe('findAllWilayah', () => {
    it('should call findAllWilayah with distrikId filter', async () => {
      organisasiService.findAllWilayah.mockResolvedValue([]);
      await controller.findAllWilayah('2');
      expect(organisasiService.findAllWilayah).toHaveBeenCalledWith(2);
    });
  });

  describe('findWilayahById', () => {
    it('should call findWilayahById with converted id', async () => {
      organisasiService.findWilayahById.mockResolvedValue({ id: 3 } as any);
      await controller.findWilayahById('3');
      expect(organisasiService.findWilayahById).toHaveBeenCalledWith(3);
    });
  });

  describe('updateWilayah', () => {
    it('should call updateWilayah with converted id', async () => {
      organisasiService.updateWilayah.mockResolvedValue({} as any);
      await controller.updateWilayah('3', { nama: 'Updated' });
      expect(organisasiService.updateWilayah).toHaveBeenCalledWith(3, { nama: 'Updated' });
    });
  });

  describe('deleteWilayah', () => {
    it('should call deleteWilayah with converted id', async () => {
      organisasiService.deleteWilayah.mockResolvedValue({} as any);
      await controller.deleteWilayah('3');
      expect(organisasiService.deleteWilayah).toHaveBeenCalledWith(3);
    });
  });

  // ─── Ranting ───

  describe('createRanting', () => {
    it('should call createRanting with data', async () => {
      const data = { wilayahId: 3, kodeRanting: 'RA', nama: 'Ranting A' };
      organisasiService.createRanting.mockResolvedValue({ id: 4, ...data } as any);
      const result = await controller.createRanting(data);
      expect(organisasiService.createRanting).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 4, ...data });
    });
  });

  describe('findAllRanting', () => {
    it('should call findAllRanting with wilayahId filter', async () => {
      organisasiService.findAllRanting.mockResolvedValue([]);
      await controller.findAllRanting('3');
      expect(organisasiService.findAllRanting).toHaveBeenCalledWith(3);
    });
  });

  describe('findRantingById', () => {
    it('should call findRantingById with converted id', async () => {
      organisasiService.findRantingById.mockResolvedValue({ id: 4 } as any);
      await controller.findRantingById('4');
      expect(organisasiService.findRantingById).toHaveBeenCalledWith(4);
    });
  });

  describe('updateRanting', () => {
    it('should call updateRanting with converted id', async () => {
      organisasiService.updateRanting.mockResolvedValue({} as any);
      await controller.updateRanting('4', { nama: 'Updated' });
      expect(organisasiService.updateRanting).toHaveBeenCalledWith(4, { nama: 'Updated' });
    });
  });

  describe('deleteRanting', () => {
    it('should call deleteRanting with converted id', async () => {
      organisasiService.deleteRanting.mockResolvedValue({} as any);
      await controller.deleteRanting('4');
      expect(organisasiService.deleteRanting).toHaveBeenCalledWith(4);
    });
  });

  // ─── Unit Latihan ───

  describe('createUnitLatihan', () => {
    it('should call createUnitLatihan with data', async () => {
      const data = { distrikId: 2, nama: 'Unit A' };
      organisasiService.createUnitLatihan.mockResolvedValue({ id: 5, ...data } as any);
      const result = await controller.createUnitLatihan(data);
      expect(organisasiService.createUnitLatihan).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 5, ...data });
    });
  });

  describe('findAllUnitLatihan', () => {
    it('should call findAllUnitLatihan with distrikId filter', async () => {
      organisasiService.findAllUnitLatihan.mockResolvedValue([]);
      await controller.findAllUnitLatihan('2');
      expect(organisasiService.findAllUnitLatihan).toHaveBeenCalledWith(2);
    });
  });

  // ─── Hierarchy ───

  describe('getHierarchy', () => {
    it('should call getHierarchyTree', async () => {
      const tree = [{ id: 1, nama: 'Nasional' }];
      organisasiService.getHierarchyTree.mockResolvedValue(tree as any);
      const result = await controller.getHierarchy();
      expect(organisasiService.getHierarchyTree).toHaveBeenCalled();
      expect(result).toEqual(tree);
    });
  });
});
