using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Lambda.Controllers;

[ApiController]
[Route("api/chats")]
public class ChatController : ControllerBase
{
    private readonly ISender _sender;
    
    public ChatController(ISender sender)
    {
        _sender = sender;
    }

    // [Authorize]
    // [HttpPost]
    // [EndpointSummary("Create Chat")]
    // [EndpointDescription("Create Chat")]
    // public async Task<IActionResult> Create(Guid chatId)
    // {
    //     
    // }

    // [Authorize]
    // [HttpGet]
    // [EndpointSummary("Create Chat")]
    // [EndpointDescription("Create Chat")]
    // public async Task<IActionResult> List()
    // {
    //     
    // }
    
    // [Authorize]
    // [HttpPost]
    // [Route("{chatId:guid}/messages")]
    // [EndpointSummary("Send Message")]
    // [EndpointDescription("SendMessage")]
    // public async Task<IActionResult> CreateMessage(Guid chatId) {}
    //
    // [Authorize]
    // [HttpGet]
    // [Route("{chatId:guid}/messages")]
    // [EndpointSummary("List Chat Messages")]
    // [EndpointDescription("List Chat Messages")]
    // public async Task<IActionResult> ListMessages(Guid chatId) {}
}