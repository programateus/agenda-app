using Backend.Application.UseCases.Entries.CreateEntry;
using Backend.Application.UseCases.Entries.DeleteEntry;
using Backend.Application.UseCases.Entries.ListEntries;
using Backend.Application.UseCases.Entries.UpdateEntry;
using Backend.Lambda.DTOs;
using Backend.Lambda.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Lambda.Controllers;

[ApiController]
[Route("api/entries")]
public class EntryController : ControllerBase
{
    private readonly ISender _sender;
    
    public EntryController(ISender sender)
    {
        _sender = sender;
    }
    
    [Authorize]
    [HttpPost]
    [EndpointSummary("Create Entry")]
    [EndpointDescription("Create Entry")]
    public async Task<IActionResult> Create(CreateEntryDTO request)
    {
        var userId = User.GetUserId() ?? throw new UnauthorizedAccessException();
        var command = new CreateEntryCommand(
            request.Title,
            request.StartDate,
            request.EndDate,
            request.Until,
            request.Frequency,
            userId
        );
        var result = await _sender.Send(command);
        return result.ToActionResult(this);
    }
    
    [Authorize]
    [HttpGet]
    [EndpointSummary("List Entries")]
    [EndpointDescription("List Entries")]
    public async Task<IActionResult> List([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var userId = User.GetUserId() ?? throw new UnauthorizedAccessException();
        var command = new ListEntriesCommand(
            userId,
            startDate,
            endDate
        );
        var result = await _sender.Send(command);
        return result.ToActionResult(this);
    }

    [Authorize]
    [HttpPut]
    [Route("{entryId:guid}")]
    [EndpointSummary("Update Entry")]
    [EndpointDescription("Update Entry")]
    public async Task<IActionResult> Update(UpdateEntryDTO request, Guid entryId)
    {
        var userId = User.GetUserId() ?? throw new UnauthorizedAccessException();
        var command = new UpdateEntryCommand(
            entryId,
            request.Title,
            request.StartDate,
            request.EndDate,
            request.Until,
            request.Frequency,
            userId,
            request.Scope,
            request.OriginalStartDate
        );
        var result = await _sender.Send(command);
        return result.ToActionResult(this);
    }
    
    [Authorize]
    [HttpDelete]
    [Route("{entryId:guid}")]
    [EndpointSummary("Update Entry")]
    [EndpointDescription("Update Entry")]
    public async Task<IActionResult> Delete(Guid entryId, DateTime originalStartDate, DeleteScope scope)
    {
        var userId = User.GetUserId() ?? throw new UnauthorizedAccessException();
        var command = new DeleteEntryCommand(
            entryId,
            userId,
            originalStartDate,
            scope
        );
        var result = await _sender.Send(command);
        return result.ToActionResult(this);
    }
}