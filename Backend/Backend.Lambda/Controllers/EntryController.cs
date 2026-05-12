using Backend.Application.UseCases.Entries.CreateEntry;
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
            request.Frequency,
            userId
        );
        var result = await _sender.Send(command);
        return result.ToActionResult(this);
    }
}