const { logger } = require('../config/pandape');

/**
 * Mapeamento de dados entre os sistemas Senior e PandaPe
 * @module mappers/seniorToPandape
 */

/**
 * Converte dados do formato Senior para o formato PandaPe
 * @param {Object} seniorData - Dados originais do Senior
 * @param {string} type - Tipo de conversão ('request' | 'vacancy')
 * @returns {Object} Dados formatados para o PandaPe
 */
function mapSeniorToPandaPe(seniorData, type) {
  try {
    if (type === 'request') {
      // Mapeamento para o endpoint /api/ExternalRequest/Insert
      const mappedData = {
        IdUser: 101074, // Usuário de suporte
        Job: seniorData.USU_TitRed || `Vaga ${seniorData.USU_CodCar || 'Padrão'}`,
        IdCategory1: seniorData.USU_IdCat1 || 54, // Ajustar com mapeamento real
        IdCategory2: seniorData.USU_IdCat2 || 795, // Ajustar com mapeamento real
        IdManagerialLevel: seniorData.USU_NivGer || 2, // Ajustar com mapeamento real
        NumberVacancies: parseInt(seniorData.USU_QtdRqu) || 1,
        IdRequestReason: seniorData.USU_MotRqu || 11, // Ajustar com mapeamento real
        ExternalCode: seniorData.USU_CodRqu || `SENIOR_${Date.now()}`,
        Description: seniorData.USU_DesReg || 'Descrição padrão',
        isConfidential: seniorData.USU_VagCon === 'S',
        CustomFields: [
          { IdRequestField: 13212, Value: seniorData.USU_CodFil || '' },
          { IdRequestField: 13213, Value: seniorData.USU_NomFil || '' },
          { IdRequestField: 13214, Value: seniorData.USU_EmpFor || '' },
          { IdRequestField: 13215, Value: seniorData.USU_DesReg || '' },
          { IdRequestField: 13218, Value: seniorData.USU_ObsSal || '' },
          { IdRequestField: 13219, Value: seniorData.USU_HorPanda || '' },
          { IdRequestField: 13220, Value: seniorData.USU_CodHor || '' },
          { IdRequestField: 13221, Value: seniorData.USU_ComHor || '' },
          { IdRequestField: 13222, Value: seniorData.USU_TipMar || '' },
          { IdRequestField: 13224, Value: seniorData.USU_ComRH || '' },
          { IdRequestField: 13225, Value: seniorData.USU_DesGru || '' },
          { IdRequestField: 13226, Value: seniorData.USU_DatRqu || '' },
          { IdRequestField: 13203, Value: seniorData.USU_DatApr || '' },
          { IdRequestField: 13201, Value: seniorData.USU_SitRqu || '' },
          { IdRequestField: 13227, Value: seniorData.USU_NumPos || '' },
          { IdRequestField: 13255, Value: seniorData.USU_EmaGer || '' },
          { IdRequestField: 13257, Value: seniorData.USU_SisOrg || '' },
          { IdRequestField: 13258, Value: seniorData.USU_DesDiv || '' },
          { IdRequestField: 13259, Value: seniorData.USU_VagCon || '' },
          { IdRequestField: 13261, Value: seniorData.USU_SLA || '' },
          { IdRequestField: 13264, Value: seniorData.USU_CodCcu || '' },
          { IdRequestField: 13245, Value: seniorData.USU_CodReg || '' },
          { IdRequestField: 13246, Value: seniorData.USU_EstCar || '' },
          { IdRequestField: 13243, Value: seniorData.USU_NumEmp || '' },
          { IdRequestField: 13244, Value: seniorData.USU_CodCar || '' },
          { IdRequestField: 13248, Value: seniorData.USU_CodCcu || '' },
          { IdRequestField: 13738, Value: seniorData.USU_GesRV || '' },
          { IdRequestField: 13202, Value: seniorData.USU_GraIns || '' }
        ].filter(field => field.Value)
      };
      logger.info('Dados mapeados para requisição com sucesso', { codRqu: seniorData.USU_CodRqu });
      return mappedData;
    } else if (type === 'vacancy') {
      // Mapeamento para o endpoint /api/Vacancy/Insert
      const mappedData = {
        IdUser: 101074,
        IdRequestToAssociate: seniorData.idRequest, // Será preenchido no api.js
        Reference: seniorData.idRequest ? seniorData.idRequest.toString() : '',
        Job: seniorData.USU_TitRed || `Vaga ${seniorData.USU_CodCar || 'Padrão'}`,
        JobComplement: null,
        IdJob: seniorData.USU_IdJob || 1005490, // Ajustar com mapeamento real
        IdCategory1: seniorData.USU_IdCat1 || 54,
        IdCategory2: seniorData.USU_IdCat2 || 795,
        IdManagerialLevel: seniorData.USU_NivGer || 2,
        Description: seniorData.USU_DesReg || 'Descrição da vaga de teste Lorem ipsum dolor sit amet.',
        NumberVacancies: parseInt(seniorData.USU_QtdRqu) || 1,
        IdContractWorkType: 1,
        IdWorkingHours: 1,
        IdWorkMethod: 1,
        SalaryMin: seniorData.USU_SalMin || "1000",
        SalaryMax: seniorData.USU_SalMax || "20000",
        HideSalary: true,
        CEP: null,
        VacancyLocationType: 0,
        CompanyHidden: 123, // Valor fixo conforme teste no Postman
        AlternativeDescription: null,
        YoutubeVideoUrl: null,
        IdStudy1Min: seniorData.USU_GraIns || 3, // Ajustar com mapeamento real
        CompanyHiddenName: "ATC", // Valor fixo conforme teste no Postman
        ContractDate: null,
        IdExperienceRange: null,
        AgeMin: null,
        AgeMax: null,
        IdSex: null,
        DeficiencyRequired: false,
        DeficiencyInformation: null,
        CIDRequired: false,
        Deficiencies: [],
        ChangeResidenceAvailabilityRequired: false,
        TravelAvailabilityRequired: false,
        VehicleRequired: false,
        LicenseRequired: false,
        IdLicenseList: [],
        Studies: [],
        Languages: [],
        Benefits: [],
        Skills: [],
        Tags: [],
        IdPortal: 40
      };
      logger.info('Dados mapeados para vaga com sucesso', { codRqu: seniorData.USU_CodRqu });
      return mappedData;
    } else {
      throw new Error('Tipo de mapeamento inválido. Use "request" ou "vacancy".');
    }
  } catch (error) {
    logger.error('Erro ao mapear dados do Senior para PandaPe', { error: error.message, seniorData, type });
    throw error;
  }
}

module.exports = { mapSeniorToPandaPe };