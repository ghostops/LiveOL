/**
 * ToDo:
 * 1. Handle too long ids, max 255 chars in the database
 * 2. Handle special characters (like åäö) - maybe use some library for slugification
 * 3. Handle multiple organizations (clubs) - maybe remove common endings like "OK", "IF", "SK", "FK", "SOK", "AIK", "KFUM"
 * 4. Maybe check for spelling mistakes somehow, cannot compare so it has to be from common static logic
 */

export class RunnerId {
  private static separator = ':';
  private static noOrganizationId = 'noorg';

  public generateId(opts: {
    className: string;
    fullName: string;
    organizationName?: string;
  }): string {
    const orgName = opts.organizationName
      ? opts.organizationName
      : RunnerId.noOrganizationId;

    return `${opts.fullName}${RunnerId.separator}${opts.className}${RunnerId.separator}${orgName}`
      .toLowerCase()
      .replace(/\s+/g, '');
  }
}

export class OrganizationId {
  public static noOrganizationId = 'noorg';

  public generateId(opts: { organizationName: string }): string {
    return opts.organizationName.toLowerCase().replace(/\s+/g, '');
  }
}

export class CompetitionId {
  private static separator = ':';
  private static noOrganizationId = 'noorg';

  public generateId(opts: {
    competitionName: string;
    organizationName: string;
  }): string {
    const orgName = opts.organizationName
      ? opts.organizationName
      : CompetitionId.noOrganizationId;

    return `${opts.competitionName}${CompetitionId.separator}${orgName}`
      .toLowerCase()
      .replace(/\s+/g, '');
  }
}
