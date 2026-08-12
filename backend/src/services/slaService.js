const SLAPolicy = require('../models/SLAPolicy');

exports.calculateSLADueDates = (ticket, slaPolicy) => {
  const createdAt = ticket.createdAt || new Date();
  const responseTime = slaPolicy.responseTime * 60 * 1000;
  const resolutionTime = slaPolicy.resolutionTime * 60 * 1000;
  
  return {
    slaDueResponse: new Date(createdAt.getTime() + responseTime),
    slaDueResolution: new Date(createdAt.getTime() + resolutionTime)
  };
};

exports.checkSLABreach = (ticket) => {
  const now = new Date();
  const responseBreached = ticket.slaDueResponse && now > ticket.slaDueResponse && !ticket.firstResponseAt;
  const resolutionBreached = ticket.slaDueResolution && now > ticket.slaDueResolution && !ticket.resolvedAt;
  
  return { responseBreached, resolutionBreached };
};

exports.getSLAStatus = (ticket) => {
  const { responseBreached, resolutionBreached } = this.checkSLABreach(ticket);
  if (responseBreached || resolutionBreached) return 'breached';
  
  const now = new Date();
  if (ticket.slaDueResponse && (ticket.slaDueResponse.getTime() - now.getTime()) < 3600000 && !ticket.firstResponseAt) return 'warning';
  if (ticket.slaDueResolution && (ticket.slaDueResolution.getTime() - now.getTime()) < 3600000 && !ticket.resolvedAt) return 'warning';
  
  return 'ok';
};

exports.applySLAToTicket = async (ticket) => {
  const policy = await SLAPolicy.findOne({ priority: ticket.priority, isActive: true }) || 
                 await SLAPolicy.findOne({ isDefault: true });
  
  if (policy) {
    const dates = this.calculateSLADueDates(ticket, policy);
    ticket.slaPolicy = policy._id;
    ticket.slaDueResponse = dates.slaDueResponse;
    ticket.slaDueResolution = dates.slaDueResolution;
  }
};
